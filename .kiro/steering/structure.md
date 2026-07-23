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
│   │   ├── admin/                 # Contexto do professor (auth + dashboard + CRUD)
│   │   │   ├── pages/            # Páginas-rota do admin
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── QuizzesPage.tsx
│   │   │   │   ├── TurmasPage.tsx
│   │   │   │   ├── HistoricoPage.tsx
│   │   │   │   └── QuizEditorPage.tsx
│   │   │   ├── components/       # Componentes exclusivos do admin
│   │   │   │   ├── AdminHeader.tsx
│   │   │   │   ├── AdminFooter.tsx
│   │   │   │   ├── AdminScreenLayout.tsx
│   │   │   │   ├── AdminQuestionDisplay.tsx
│   │   │   │   ├── AdminPodiumPanel.tsx
│   │   │   │   ├── AdminMusicControl.tsx
│   │   │   │   ├── FullScoreboardTable.tsx
│   │   │   │   ├── PlayersSidebar.tsx
│   │   │   │   ├── QuestionControlPanel.tsx
│   │   │   │   └── WaitingRoomPanel.tsx
│   │   │   ├── hooks/            # Hooks exclusivos do admin
│   │   │   │   ├── useAdminSocket.ts
│   │   │   │   ├── useThemes.ts
│   │   │   │   ├── useQuizzes.ts
│   │   │   │   └── useQuestions.ts
│   │   │   └── store/
│   │   │       └── useAdminStore.ts
│   │   │
│   │   ├── player/                # Contexto do aluno (fluxo de jogo)
│   │   │   ├── pages/            # Páginas-rota do player
│   │   │   │   ├── JoinRoomPage.tsx
│   │   │   │   ├── AvatarSelectPage.tsx
│   │   │   │   ├── LobbyPage.tsx
│   │   │   │   ├── QuestionPage.tsx
│   │   │   │   ├── ResultPage.tsx
│   │   │   │   └── PodiumPage.tsx
│   │   │   ├── components/       # Componentes exclusivos do player
│   │   │   │   ├── JoinRoomForm.tsx
│   │   │   │   ├── QuestionView.tsx
│   │   │   │   ├── QuestionResultView.tsx
│   │   │   │   ├── PodiumView.tsx
│   │   │   │   ├── TopNavBar.tsx
│   │   │   │   ├── TimerDisplay.tsx
│   │   │   │   ├── AvatarBadge.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── ScorePill.tsx
│   │   │   │   ├── PointsGainedCard.tsx
│   │   │   │   ├── PositionCard.tsx
│   │   │   │   └── OptionButton.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePlayerSocket.ts
│   │   │   └── store/
│   │   │       └── useGameStore.ts
│   │   │
│   │   ├── shared/                # Código usado por AMBOS os contextos
│   │   │   ├── components/
│   │   │   │   ├── PodiumDisplay.tsx
│   │   │   │   ├── RankingRow.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── TextField.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSocket.ts
│   │   │   │   ├── useCountdown.ts
│   │   │   │   └── useBackgroundMusic.ts
│   │   │   ├── store/
│   │   │   │   └── useSettingsStore.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── pages/                 # Shells de roteamento de topo
│   │   │   ├── AdminPage.tsx      # Layout + sub-rotas admin (lazy-loaded)
│   │   │   └── PlayerPage.tsx     # Orquestrador do fluxo do aluno
│   │   ├── schemas/               # Zod schemas (RHF validation)
│   │   ├── services/              # api.ts (apiFetch), imagekit.ts
│   │   ├── lib/                   # utils.ts (cn()), jwt.ts
│   │   ├── types/                 # events.ts, turma.ts
│   │   ├── styles/                # globals.css (Tailwind @theme)
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── .env
│
└── .kiro/
    ├── steering/
    ├── specs/
    └── hooks/
```

## Próximos passos (planejado, não implementado ainda)

Os seguintes itens estão previstos nas specs mas **ainda não existem** no repo:
- `backend/src/game/game-room.service.ts` — gate de entrada (spec `room-lifecycle-single-room`)
- Migração das páginas AdminQuizzesPage/AdminTurmasPage/EditQuizPage para usar
  `shared/components/Button`, `TextField`, `ConfirmDialog` (prompt separado por página)

## Regra de ouro por camada (frontend)

- **`pages/`** (raiz): só shells de roteamento (`AdminPage`, `PlayerPage`). `AdminPage`
  é lazy-loaded e contém sub-rotas via React Router. Nenhuma lógica de domínio.
- **`admin/pages/`**: composição de componentes de `admin/components/` + hooks de
  `admin/hooks/`. Pode ter `useForm` (RHF) local para formulários.
- **`player/pages/`**: composição de componentes de `player/components/` + hooks.
  Nunca chama `socket.on` diretamente — isso vive em `usePlayerSocket`.
- **`*/components/`**: componentes de apresentação que recebem dados por props.
  Componentes em `shared/components/` devem ser puros e sem estado de domínio.
- **`*/hooks/`**: encapsulam efeitos colaterais (socket, fetch, timers).
- **`*/store/`**: Zustand — única fonte de verdade para estado cross-componente.
  Cada contexto tem sua store (`useAdminStore`, `useGameStore`); `useSettingsStore`
  em shared é cross-contexto (preferências do usuário como volume).
- **`schemas/`**: Zod schemas para validação de formulários (RHF + zodResolver).
- **`services/`**: `apiFetch` centralizado; nenhuma página faz `fetch()` direto.

## Regra de ouro por camada (backend)

- **Gateway** (`*.gateway.ts`): transporte fino. Decodifica payload → chama service →
  emite evento. Nenhuma regra de negócio.
- **Services**: regra de negócio + acesso a dados via `@InjectRepository`.
- **DTOs** (`dto/*.dto.ts`): validação de entrada REST com `class-validator`.
