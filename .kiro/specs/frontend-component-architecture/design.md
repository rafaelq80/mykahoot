# Design — Refatoração da Arquitetura de Componentes (Frontend)

## Padrão arquitetural

**Container leve (page) → Feature (hook + componentes) → Shared (componentes puros) →
Store (Zustand, estado cross-cutting).** Cada camada só conhece a camada abaixo.

```
pages/player/QuestionPage.tsx
  └─ features/question-flow/components/QuestionCard.tsx
       ├─ components/shared/OptionButton.tsx (x4, via map)
       ├─ components/shared/TimerDisplay.tsx
       └─ components/shared/ProgressBar.tsx
  (dados vêm de) features/question-flow/hooks/useQuestionFlow.ts
       └─ lê/escreve stores/useGameStore.ts
       └─ stores/useGameStore.ts é alimentada por hooks/useSocket.ts
```

## Decomposição por tela

### `PlayerPage.tsx` → 5 páginas + `features/player-session` + `features/question-flow` + `features/ranking`

| Novo arquivo | Responsabilidade |
|---|---|
| `pages/player/JoinRoomPage.tsx` | Renderiza `JoinRoomForm` (PIN) — usa `features/player-session/hooks/useJoinRoom` |
| `pages/player/LobbyPage.tsx` | Renderiza `PlayerList` + `WaitingMessage` (sala aberta/fechada — depende da spec de sala única) |
| `pages/player/QuestionPage.tsx` | Renderiza `QuestionCard` (grid 2×2 + timer + progress bar) |
| `pages/player/ResultPage.tsx` | Renderiza `AnswerFeedback` + `RankingList` (top 5) |
| `pages/player/PodiumPage.tsx` | Renderiza `Podium3D` + `RankingList` completo |

`features/player-session/hooks/useJoinRoom.ts`: encapsula `RHF + Zod` do formulário
PIN/nickname/avatar, chama `socket.emit('player:entrar', ...)`, escreve resultado em
`useGameStore`.

`features/question-flow/hooks/useQuestionFlow.ts`: assina `game:novaPergunta`,
`game:resultado`; expõe `currentQuestion`, `timeLeft`, `selectedIndex`,
`submitAnswer()`.

### `AdminDashboardPage.tsx` → `pages/admin/AdminDashboardPage.tsx` (composição) + `features/admin-control`

| Novo arquivo | Responsabilidade |
|---|---|
| `features/admin-control/components/RoomStatusPanel.tsx` | Mostra sala aberta/fechada, contagem de jogadores, botão abrir/fechar |
| `features/admin-control/components/QuestionControlPanel.tsx` | Botão contextual (liberar pergunta / próxima pergunta / encerrar) |
| `features/admin-control/components/LiveAnswersCounter.tsx` | "Responderam X/Y" |
| `features/admin-control/components/FullScoreboardTable.tsx` | Tabela de placar completo (shadcn `Table`) |
| `features/admin-control/hooks/useAdminGameSocket.ts` | Toda assinatura `admin:*`/`game:*` relevante ao dashboard |

`AdminDashboardPage.tsx` final: ~40 linhas, só monta o layout (sidebar + grid dos 4
painéis acima) e chama `useAdminGameSocket()` uma vez no topo, repassando os dados via
props ou lendo direto de `useAdminStore` dentro de cada painel.

### `AdminQuizzesPage.tsx` → `pages/admin/AdminQuizzesPage.tsx` (composição) + `features/quiz-editor`

| Novo arquivo | Responsabilidade |
|---|---|
| `features/quiz-editor/components/QuizList.tsx` | Lista + busca de quizzes |
| `features/quiz-editor/components/QuizForm.tsx` | Criar/editar quiz (RHF+Zod) |
| `features/quiz-editor/components/QuestionForm.tsx` | Criar/editar pergunta, inclui `ImageUploadField` (spec própria) |
| `features/quiz-editor/components/ThemeForm.tsx` | Criar/editar tema |
| `features/quiz-editor/hooks/useCreateQuiz.ts`, `useUpdateQuestion.ts`, ... | Um hook por operação de mutação, usando `services/api.ts` |

## Estratégia de migração (incremental, sem quebrar)

1. Criar a nova estrutura de pastas vazia (`features/*`, `components/shared/*`).
2. Migrar `PlayerPage` primeiro (menor risco, fluxo mais isolado).
3. Extrair `useSocket` como singleton antes de tocar nos outros dois — ele é
   dependência comum.
4. Migrar `AdminDashboardPage`.
5. Migrar `AdminQuizzesPage` por último (é o maior e depende da spec de upload de
   imagem, então convém alinhar as duas).
6. Remover os arquivos antigos de `pages/*.tsx` só depois que o novo caminho estiver
   testado (tasks marcam isso explicitamente).

## Critérios de aceite

- Nenhum arquivo em `pages/` excede 80 linhas.
- Nenhum arquivo em `features/*/components` excede 150 linhas.
- `npm run build` do frontend passa sem erro de tipo.
- Fluxo E2E manual (entrar → responder → ranking; login admin → abrir sala → avançar
  pergunta → encerrar) continua funcional.
