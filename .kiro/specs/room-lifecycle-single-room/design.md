# Design — Sala Única com Gate de Entrada

## Backend

### Novo serviço `GameRoomService` (`backend/src/game/game-room.service.ts`)

Extrai de `GameStateService` a responsabilidade de ciclo de vida da sala (hoje
implícita no `status`), deixando `GameStateService` focado em estado de jogo em
progresso (pergunta atual, jogadores, respostas):

```ts
@Injectable()
export class GameRoomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameState: GameStateService,
    private readonly logger = new Logger(GameRoomService.name),
  ) {}

  async abrirSala(quizId: string): Promise<GameSession> {
    if (this.isRoomActive()) {
      throw new BadRequestException('Encerre a sala atual antes de abrir uma nova.')
    }
    const session = await this.prisma.gameSession.create({ data: { quizId, status: 'em_andamento' } })
    this.gameState.iniciarLobby(session.id, quizId)
    return session
  }

  async fecharSala(motivo: 'admin_fechou' | 'jogo_finalizado'): Promise<void> {
    const { gameSessionId, status } = this.gameState.state
    if (gameSessionId && status !== 'finalizado') {
      await this.prisma.gameSession.update({
        where: { id: gameSessionId },
        data: { status: 'interrompida' },
      })
    }
    this.gameState.resetar()
  }

  isRoomActive(): boolean {
    const { status } = this.gameState.state
    return status !== 'inativo' && status !== 'finalizado'
  }
}
```

### Gateway — novos handlers

```ts
@SubscribeMessage('admin:abrirSala')
async handleAbrirSala(@MessageBody() { quizId }: { quizId: string }, @ConnectedSocket() admin: Socket) {
  const session = await this.gameRoomService.abrirSala(quizId)
  this.server.emit('game:salaStatus', { open: true, quizId })
  this._emitAdminEstado()
}

@SubscribeMessage('admin:fecharSala')
async handleFecharSala() {
  await this.gameRoomService.fecharSala('admin_fechou')
  this.server.to('players').emit('game:salaFechada', { reason: 'admin_fechou' })
  const sockets = await this.server.in('players').fetchSockets()
  for (const s of sockets) { s.leave('players'); s.disconnect(true) }
  this.server.emit('game:salaStatus', { open: false })
  this._emitAdminEstado()
}
```

`handleEntrar` (`player:entrar`) já valida `status === 'lobby'` — mantido, apenas a
mensagem de erro passa a ser consistente com o novo evento `game:salaStatus` que o
front usa proativamente (o erro de `player:entrar` continua existindo como defesa,
mas na UX normal o front nunca deveria chegar a chamar `player:entrar` com a sala
fechada, pois o formulário já estará oculto).

### Evento novo: `game:salaStatus`

Emitido em broadcast (`this.server.emit`, fora da room `players`, pois precisa
alcançar quem ainda nem entrou) sempre que a sala abre ou fecha, e também sob
demanda quando um novo cliente conecta (`handleConnection` emite o status atual para
o socket recém-conectado).

```ts
interface SalaStatusPayload {
  open: boolean
  quizId?: string
}
```

## Frontend

### `stores/useRoomStore.ts`

```ts
socket.on('game:salaStatus', (payload) => {
  if (payload.open) useRoomStore.getState().setOpen(payload.quizId!)
  else useRoomStore.getState().setClosed()
})

socket.on('game:salaFechada', (payload) => {
  useRoomStore.getState().setClosed(payload.reason)
  useGameStore.getState().reset()
  // navegação para tela inicial acontece no componente que assiste useRoomStore
})
```

### `features/player-session/components/RoomGate.tsx`

Componente que envolve `JoinRoomPage`:

```tsx
export function RoomGate({ children }: { children: React.ReactNode }) {
  const isOpen = useRoomStore((s) => s.isOpen)
  const closedReason = useRoomStore((s) => s.closedReason)
  if (!isOpen) return <WaitingForRoomScreen reason={closedReason} />
  return <>{children}</>
}
```

`WaitingForRoomScreen`: mensagem "Aguarde o professor abrir a sala", ícone/animação
leve, e — se `closedReason === 'admin_fechou'` — uma variação de texto "O professor
encerrou a sessão. Aguarde uma nova sala." Nenhum polling HTTP: a tela reage
puramente à store, que é atualizada pelo listener de socket já ativo desde o
bootstrap.

### `features/admin-control/components/RoomStatusPanel.tsx`

Botão único, contextual:
- Sala fechada → **"Abrir Sala"** (abre um `Select` de quiz se ainda não escolhido,
  depois chama `useAdminStore.getState().openRoom(quizId)`)
- Sala aberta → **"Fechar Sala"** (shadcn `Dialog` de confirmação: "Isso vai
  desconectar N jogadores. Confirmar?") → `useAdminStore.getState().closeRoom()`

## Contrato de eventos (adicionar a `game.types.ts` e `frontend/src/types/events.ts`)

| Evento | Direção | Payload |
|---|---|---|
| `admin:abrirSala` | professor → servidor | `{ quizId: string }` |
| `admin:fecharSala` | professor → servidor | `{}` |
| `game:salaStatus` | servidor → todos | `{ open: boolean; quizId?: string }` |
| `game:salaFechada` | servidor → jogadores | `{ reason: 'admin_fechou' \| 'jogo_finalizado' }` |

## Critérios de aceite

- Aluno não vê o formulário de nickname/avatar enquanto `useRoomStore().isOpen ===
  false`.
- Fechar a sala com jogadores conectados desconecta 100% dos sockets da room
  `players` em até 1 evento de round-trip (sem polling).
- Tentar abrir uma segunda sala com uma já ativa retorna erro tratado (toast no
  dashboard), sem quebrar o estado da sala existente.
