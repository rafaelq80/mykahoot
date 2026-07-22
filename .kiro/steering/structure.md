---
title: Project Structure
inclusion: always
---

# Estrutura de Pastas

## Estado atual (reflete o repositório real)

```
/
├── backend/
│   ├── src/
│   │   ├── admin/                 # AdminModule (auth JWT, entidade Admin)
│   │   │   ├── entities/admin.entity.ts
│   │   │   ├── dto/
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.module.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── jwt.guard.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── theme/                 # ThemeModule (CRUD de temas)
│   │   │   ├── entities/theme.entity.ts
│   │   │   ├── dto/
│   │   │   ├── theme.controller.ts
│   │   │   ├── theme.module.ts
│   │   │   └── theme.service.ts
│   │   ├── quiz/                  # QuizModule (CRUD quiz/pergunta + ImageKit)
│   │   │   ├── entities/quiz.entity.ts, question.entity.ts
│   │   │   ├── dto/
│   │   │   ├── quiz.controller.ts
│   │   │   ├── imagekit.controller.ts
│   │   │   ├── quiz.module.ts
│   │   │   └── quiz.service.ts
│   │   ├── turma/                 # TurmaModule (CRUD de turmas)
│   │   │   ├── entities/turma.entity.ts
│   │   │   ├── dto/
│   │   │   ├── turma.controller.ts
│   │   │   ├── turma.module.ts
│   │   │   └── turma.service.ts
│   │   ├── aluno/                 # AlunoModule (CRUD de alunos por turma)
│   │   │   ├── entities/aluno.entity.ts
│   │   │   ├── dto/
│   │   │   ├── aluno.controller.ts
│   │   │   ├── aluno.module.ts
│   │   │   └── aluno.service.ts
│   │   ├── game/                  # GameModule (sala de jogo ao vivo)
│   │   │   ├── entities/game-session.entity.ts, player-result.entity.ts
│   │   │   ├── game.gateway.ts
│   │   │   ├── game-state.service.ts
│   │   │   ├── game-results.service.ts
│   │   │   ├── game.module.ts
│   │   │   └── game.types.ts
│   │   ├── database/              # DatabaseModule (@Global, TypeORM config)
│   │   │   ├── data-source.ts        # DataSource para CLI de migrations
│   │   │   ├── database.module.ts     # TypeOrmModule.forRootAsync + forFeature
│   │   │   └── migrations/           # Arquivos de migration TS
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── MIGRATION_NOTES.md         # Racional da migração Prisma → TypeORM
│   ├── render.yaml                # Deploy config para Render (backend)
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Componentes de ROTA
│   │   │   ├── player/            # Sub-pages do aluno
│   │   │   │   ├── JoinRoomPage.tsx
│   │   │   │   ├── LobbyPage.tsx
│   │   │   │   ├── QuestionPage.tsx
│   │   │   │   ├── ResultPage.tsx
│   │   │   │   └── PodiumPage.tsx
│   │   │   ├── AdminPage.tsx          # Container c/ nav + tabs
│   │   │   ├── AdminLoginPage.tsx
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminQuizzesPage.tsx
│   │   │   ├── AdminHistoricoPage.tsx
│   │   │   ├── AdminTurmasPage.tsx
│   │   │   └── PlayerPage.tsx         # Orquestrador do fluxo do aluno
│   │   ├── features/              # Lógica de domínio por feature
│   │   │   ├── player-session/    #   JoinRoomForm, usePlayerSocket
│   │   │   ├── question-flow/     #   QuestionView
│   │   │   ├── ranking/           #   QuestionResultView, PodiumView
│   │   │   └── admin-control/     #   WaitingRoomPanel, QuestionControlPanel, etc.
│   │   ├── components/shared/     # Puros: AvatarBadge, OptionButton, TimerDisplay, etc.
│   │   ├── hooks/                 # Hooks técnicos (useSocket, useCountdown)
│   │   ├── stores/                # Zustand (useGameStore, useAdminStore)
│   │   ├── types/                 # events.ts (espelha backend game.types.ts)
│   │   ├── styles/                # globals.css (Tailwind @theme)
│   │   ├── lib/                   # utils.ts (cn())
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── render.yaml                # LEGADO — não utilizado (deploy é via Vercel)
│   └── .env
│
└── .kiro/
    ├── steering/
    ├── specs/
    └── hooks/
```

## Próximos passos (planejado, não implementado ainda)

Os seguintes diretórios estão previstos nas specs mas **ainda não existem** no repo:
- `frontend/src/schemas/` — Zod schemas (depende de `forms-validation` spec)
- `frontend/src/services/` — Clientes HTTP centralizados
- `frontend/src/components/ui/` — shadcn/ui gerados (depende de `design-system-tailwind-migration` tasks 3-4)
- `frontend/src/features/quiz-editor/` — extração dos forms de quiz/pergunta
- `frontend/src/features/background-music/` — player de música + toggle
- `backend/src/game/game-room.service.ts` — gate de entrada (spec `room-lifecycle-single-room`)

## Regra de ouro por camada (frontend)

- **`pages/`**: só roteamento + composição de componentes de `features/`. Nunca tem
  `useState` de domínio, nunca chama `socket.on` diretamente.
- **`features/<nome>/`**: contém `components/`, `hooks/` e regra de negócio.
- **`components/shared/`**: componentes puros e sem estado de domínio, só props.
- **`stores/`**: única fonte de verdade para estado cross-componente.

## Regra de ouro por camada (backend)

- **Gateway** (`*.gateway.ts`): transporte fino. Decodifica payload → chama service →
  emite evento. Nenhuma regra de negócio.
- **Services**: regra de negócio + acesso a dados via `@InjectRepository`.
- **DTOs** (`dto/*.dto.ts`): validação de entrada REST com `class-validator`.
