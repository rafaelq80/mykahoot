# Design: Sala Única — Ciclo de Vida

## Máquina de estados

```
                   admin:selecionarTema
    ┌─────────┐ ─────────────────────────▸ ┌─────────┐
    │ inativo │                            │  lobby  │
    └─────────┘ ◂───────────────────────── └─────────┘
         ▲        admin:encerrarSala            │
         │        (qualquer estado)             │ admin:liberarPergunta
         │                                     ▼
         │                              ┌───────────────┐
         │         admin:encerrarSala    │pergunta_ativa │◂───┐
         │◂──────────────────────────── └───────────────┘    │
         │                                     │             │
         │              timeout / todos resp.   │             │
         │                                     ▼             │
         │                              ┌───────────────────┐│
         │         admin:encerrarSala    │mostrando_resultado││ admin:proximaPergunta
         │◂──────────────────────────── └───────────────────┘│ (se há mais)
         │                                     │             │
         │           admin:proximaPergunta      │─────────────┘
         │           (última) / finalizarJogo   │
         │                                     ▼
         │                              ┌───────────┐
         │         admin:encerrarSala    │finalizado │
         └◂──────────────────────────── └───────────┘
```

## Arquitetura real

### Onde vive a lógica

| Responsabilidade | Arquivo |
|---|---|
| Estado em memória (status, players, timer) | `game-state.service.ts` |
| Transporte WebSocket (eventos) | `game.gateway.ts` |
| Persistência de resultado + recovery no startup | `game-results.service.ts` |

**Nota**: o `steering/structure.md` antigo listava um `game-room.service.ts` separado.
Ele **nunca foi criado**. Toda a lógica de abrir/fechar sala vive hoje dentro de
`GameStateService.abrirSala()` + `GameStateService.resetar()` e handlers no gateway.
A decisão de extrair ou não para um service separado está em aberto — funcionalmente
não muda nada, é apenas organização interna.

### Eventos WebSocket relevantes

| Evento | Direção | Quando |
|---|---|---|
| `admin:selecionarTema` | admin→server | Abre sala |
| `admin:liberarPergunta` | admin→server | Inicia pergunta |
| `admin:proximaPergunta` | admin→server | Avança (ou finaliza se última) |
| `admin:finalizarJogo` | admin→server | Encerra jogo a qualquer momento |
| `admin:encerrarSala` | admin→server | Fecha sala forçadamente (qualquer status) |
| `game:estado` | server→broadcast | Após qualquer transição de status |
| `game:salaEncerrada` | server→players | Quando professor fecha sala — frontend redireciona alunos para entry com mensagem |
| `game:erro` | server→client | Ação inválida (ex: entrar com sala fechada) |
| `admin:estado` | server→admins | Status detalhado para dashboard do professor |

### Controle de entrada (gate)

```
player:entrar { turmaId, alunoId, avatar }
  ↓
  status === 'lobby'?  ──no──▸  game:erro "sala não está aberta"
  ↓ yes
  AlunoService.findAlunoInTurma(turmaId, alunoId)
  ↓ throws? ──▸ game:erro "aluno não encontrado nesta turma"
  ↓ ok
  duplicidade por alunoId? ──▸ game:erro "já está conectado"
  ↓ no
  cria PlayerResult (banco) + adiciona ao Map em memória
  ↓
  game:estado atualizado (broadcast)
```

### Encerramento forçado (`admin:encerrarSala`)

```
admin:encerrarSala
  ↓
  limpa timer (se pergunta ativa)
  ↓
  GameSession.status → 'interrompida' (banco)
  ↓
  emite game:salaEncerrada para sala 'players'
    → frontend: setScreen('entry') + mensagem "sala encerrada pelo professor"
  ↓
  GameStateService.resetar() → status = 'inativo'
  ↓
  game:estado { status: 'inativo' } broadcast
```

Os sockets dos jogadores **não são desconectados fisicamente** — o redirect é
feito pelo handler `game:salaEncerrada` no frontend. Funcionalmente equivalente
a desconexão (o aluno volta à tela inicial e precisa re-entrar), mas o socket
TCP permanece aberto e recebe o subsequente `game:estado { status: 'inativo' }`.

### Recovery no startup (`onModuleInit`)

`GameResultsService.onModuleInit()`:
- `UPDATE GameSession SET status = 'interrompida' WHERE status = 'em_andamento'`
- Garante que reinícios do backend (deploy, crash) não deixem sessões "fantasma"

### Frontend — tratamento de estados

| `game:estado.status` | Tela exibida (PlayerPage) |
|---|---|
| `inativo` | Entry (seleção de turma/aluno/avatar) |
| `lobby` (após entrar) | Lobby (aguardando professor) |
| `pergunta_ativa` | QuestionPage |
| `mostrando_resultado` | ResultPage |
| `finalizado` | PodiumPage |

Handler `game:salaEncerrada`: `setScreen('entry')` + `setErrorMessage(...)` — mesmo
efeito visual de `status: 'inativo'`, mas com mensagem explicativa.
