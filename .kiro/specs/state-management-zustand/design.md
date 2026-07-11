# Design — Estado Global com Zustand

## Stores

### `stores/useGameStore.ts` (estado do aluno durante a partida)

```ts
interface GameStore {
  status: 'idle' | 'lobby' | 'pergunta_ativa' | 'mostrando_resultado' | 'finalizado'
  self: { nickname: string; avatar: string; score: number } | null
  currentQuestion: { id: string; text: string; imageUrl?: string; timeLimitSec: number } | null
  questionStartedAt: number | null
  selectedIndex: number | null
  lastResult: { correct: boolean; pointsEarned: number; correctIndex: number } | null
  topRanking: RankingEntry[]

  setLobby(): void
  setQuestion(q: GameStore['currentQuestion']): void
  selectAnswer(index: number): void            // emite player:responder via socket
  setResult(payload: ResultPayload): void
  setFinal(ranking: RankingEntry[]): void
  reset(): void
}
```

Seletores expostos: `useCurrentQuestion()`, `useTimeLeft()` (calcula a partir de
`questionStartedAt` + `timeLimitSec`, atualizado por `useCountdown`),
`useSelfScore()`.

### `stores/useAdminStore.ts` (estado do dashboard do professor)

```ts
interface AdminStore {
  quizId: string | null
  status: GameStatus
  players: PlayerSummary[]
  currentQuestionIndex: number
  answeredCount: number
  fullScoreboard: RankingEntry[]

  openRoom(quizId: string): void   // emite admin:abrirSala
  closeRoom(): void                 // emite admin:fecharSala
  nextQuestion(): void              // emite admin:proximaPergunta
  syncFromSocket(event, payload): void
}
```

### `stores/useRoomStore.ts` (estado de sala aberta/fechada — lido pelo gate de entrada do aluno)

```ts
interface RoomStore {
  isOpen: boolean
  activeQuizTitle: string | null
  setOpen(quizTitle: string): void
  setClosed(reason?: 'admin_fechou' | 'jogo_finalizado'): void
}
```

Detalhes completos de uso desta store estão na spec `room-lifecycle-single-room`.

### `stores/useSettingsStore.ts` (única store persistida)

```ts
interface SettingsStore {
  musicEnabled: boolean
  volume: number // 0–1
  toggleMusic(): void
  setVolume(v: number): void
}

export const useSettingsStore = create<SettingsStore>()(
  persist((set) => ({ ... }), { name: 'mykahoot-settings' })
)
```

## Integração com `useSocket`

`useSocket.ts` **não** guarda estado de domínio — ele só expõe `getSocket()` e um
`registerGameListeners()` chamado uma vez no bootstrap (`app/App.tsx`), que assina os
eventos de socket e delega para as actions das stores:

```ts
socket.on('game:novaPergunta', (payload) => useGameStore.getState().setQuestion(payload))
socket.on('game:resultado', (payload) => useGameStore.getState().setResult(payload))
socket.on('game:salaFechada', (payload) => {
  useRoomStore.getState().setClosed(payload.reason)
  useGameStore.getState().reset()
})
```

Isso mantém a regra R2 (escrita só via action) e evita que cada componente precise
assinar/desassinar listeners manualmente.

## Critérios de aceite

- Nenhum `socket.on`/`socket.emit` fora de `hooks/useSocket.ts` e das actions das
  stores.
- `grep -r "useState" frontend/src/pages` não deve encontrar estado de domínio de
  jogo (estado de UI local, como "dialog aberto", é aceitável).
- `useSettingsStore` sobrevive a reload de página; as demais stores não.
