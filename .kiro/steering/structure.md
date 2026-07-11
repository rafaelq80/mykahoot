---
title: Project Structure
inclusion: always
---

# Estrutura de Pastas Alvo

A estrutura abaixo é o **alvo** desta evolução. Ela substitui o layout "tudo em
`pages/`" da v1. Ao gerar código, sempre criar/mover arquivos para os locais corretos
abaixo — não acumular lógica em componentes de página.

```
/
├── backend/
│   ├── src/
│   │   ├── theme/                 # ThemeModule (CRUD de temas)
│   │   ├── quiz/                  # QuizModule (CRUD de quiz/pergunta + imagekit)
│   │   ├── game/                  # GameModule
│   │   │   ├── game.gateway.ts        # Fino: só (de)serializa eventos e chama services
│   │   │   ├── game-state.service.ts  # Estado em memória da sala única
│   │   │   ├── game-room.service.ts   # NOVO: abrir/fechar sala, gate de entrada
│   │   │   ├── game-results.service.ts
│   │   │   └── game.types.ts          # Fonte de verdade dos contratos de evento
│   │   ├── admin/                 # AdminModule (auth JWT)
│   │   └── prisma/                # PrismaService
│   ├── prisma/schema.prisma
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/                   # Bootstrap: main.tsx, App.tsx, router
│   │   ├── pages/                 # Componentes de ROTA — finos, só compõem
│   │   │   ├── player/
│   │   │   │   ├── JoinRoomPage.tsx
│   │   │   │   ├── LobbyPage.tsx
│   │   │   │   ├── QuestionPage.tsx
│   │   │   │   ├── ResultPage.tsx
│   │   │   │   └── PodiumPage.tsx
│   │   │   └── admin/
│   │   │       ├── AdminLoginPage.tsx
│   │   │       ├── AdminDashboardPage.tsx
│   │   │       ├── AdminQuizzesPage.tsx
│   │   │       └── AdminHistoricoPage.tsx
│   │   ├── features/              # Lógica de domínio por feature (UI + hooks locais)
│   │   │   ├── player-session/    #   avatar picker, nickname form, join-gate
│   │   │   ├── question-flow/     #   grid de alternativas, timer, progress bar
│   │   │   ├── ranking/           #   podium, ranking row, ranking list
│   │   │   ├── quiz-editor/       #   form de quiz/pergunta, upload de imagem
│   │   │   ├── admin-control/     #   painel de controle de partida do professor
│   │   │   └── background-music/ #   player de música + toggle
│   │   ├── components/ui/         # shadcn/ui (gerado, não editar à mão)
│   │   ├── components/shared/     # Componentes puros reutilizáveis entre features
│   │   │   (AvatarBadge, ScorePill, OptionButton, TimerDisplay, ProgressBar, RankingRow)
│   │   ├── hooks/                 # Hooks técnicos e transversais
│   │   │   ├── useSocket.ts           # Singleton de conexão Socket.io
│   │   │   ├── useBackgroundMusic.ts
│   │   │   └── useCountdown.ts
│   │   ├── stores/                # Zustand
│   │   │   ├── useGameStore.ts        # Estado de jogo do aluno
│   │   │   ├── useAdminStore.ts       # Estado do painel do professor
│   │   │   ├── useRoomStore.ts        # Estado de sala aberta/fechada (NOVO)
│   │   │   └── useSettingsStore.ts    # Preferência de música, volume
│   │   ├── schemas/               # Zod schemas (form + validação de payload de socket)
│   │   ├── services/              # Clientes HTTP (api.ts, imagekit.ts)
│   │   ├── types/                 # Tipos TS compartilhados (events.ts espelha o backend)
│   │   ├── styles/                # globals.css (camadas Tailwind) + fonts
│   │   └── lib/                   # utils.ts (cn(), formatters)
│   └── .env
│
└── .kiro/
    ├── steering/   # Este arquivo e os demais — carregados sempre ou por fileMatch
    ├── specs/      # Uma pasta por feature: requirements.md, design.md, tasks.md
    └── hooks/      # Automação orientada a evento (*.kiro.hook)
```

## Regra de ouro por camada (frontend)

- **`pages/`**: só roteamento + composição de componentes de `features/`. Nunca tem
  `useState` de domínio, nunca chama `socket.on` diretamente. Se uma page passar de
  ~80 linhas, é sinal de que lógica vazou para lá — mover para `features/`.
- **`features/<nome>/`**: contém `components/`, `hooks/` (ex.: `useJoinRoom.ts`) e
  eventualmente `schema.ts` daquela feature. É onde a regra de negócio mora.
- **`components/shared/`**: componentes puros e sem estado de domínio, só props.
- **`stores/`**: única fonte de verdade para estado que precisa ser lido por mais de um
  componente. Estado local de formulário fica em RHF, não em Zustand.

## Regra de ouro por camada (backend)

- **Gateway** (`*.gateway.ts`): só mapeia `@SubscribeMessage` → chama um método de
  service → emite o evento de resposta. Nenhuma regra de negócio dentro do gateway.
- **Services**: contêm a regra de negócio e são a única camada que fala com
  `PrismaService` ou com o estado em memória (`GameStateService`/`GameRoomService`).
- **DTOs** (`dto/*.dto.ts`): validação de entrada REST com `class-validator`. Os
  eventos de socket usam os tipos de `game.types.ts` + validação manual leve no
  gateway (guard clauses), documentado na spec correspondente.
