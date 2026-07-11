# Implementation Plan: Refatoração da Arquitetura de Componentes (Frontend)

## Overview

Decompor os componentes "god" da v1 (`PlayerPage.tsx`, `AdminDashboardPage.tsx`, `AdminQuizzesPage.tsx`) seguindo a estrutura alvo definida em `steering/structure.md`: pages finas (~80 linhas), features com lógica de domínio, components/shared puros, stores Zustand.

## Tasks

- [x] 1. Criar esqueleto de pastas: `features/{player-session,question-flow,ranking}`, `components/shared`, `stores`, `lib`
- [x] 2. Consolidar `hooks/useSocket.ts` como singleton expondo `getSocket()`
- [x] 3. Criar `components/shared`: `AvatarBadge`, `ScorePill`, `OptionButton`, `TimerDisplay`, `ProgressBar`, `RankingRow`
- [x] 4. Criar `features/player-session`: `usePlayerSocket` + `JoinRoomForm`
- [x] 5. Criar `features/question-flow`: `QuestionView` (grid de alternativas + timer)
- [x] 6. Criar `features/ranking`: `QuestionResultView`, `PodiumView`
- [x] 7. Criar `pages/player/{JoinRoomPage,LobbyPage,QuestionPage,ResultPage,PodiumPage}.tsx` como composições finas
- [x] 8. Reescrever `pages/PlayerPage.tsx` como orquestrador fino: monta socket bridge, switch de screen por store
- [ ] 9. Remover `styles/PlayerPage.module.css` e verificar que `PlayerPage.tsx` não o importa mais
- [ ] 10. Criar pastas `features/{admin-control,quiz-editor,background-music}`
- [ ] 11. Extrair `features/admin-control`: `RoomStatusPanel`, `QuestionControlPanel`, `LiveAnswersCounter`, `FullScoreboardTable`, `useAdminSocket`
- [ ] 12. Reescrever `pages/admin/AdminDashboardPage.tsx` como composição desses painéis (< 80 linhas)
- [ ] 13. Remover `styles/AdminPage.module.css` após validar
- [ ] 14. Extrair `features/quiz-editor`: `QuizList`, `QuizForm`, `QuestionForm`, `ThemeForm` + hooks de mutação
- [ ] 15. Reescrever `pages/admin/AdminQuizzesPage.tsx` como composição (< 80 linhas)
- [ ] 16. Remover `styles/AdminForms.module.css` após validar
- [ ] 17. Adicionar testes (Vitest + Testing Library) para cada hook de `features/*/hooks`
- [ ] 18. Rodar `npm run build` e corrigir erros de tipo; verificar que nenhum arquivo em `pages/` > 80 linhas e em `features/*/components` > 150 linhas

## Task Dependency Graph

```
1 → 2 → 3 → 4 → 7 → 8 → 9
3 → 5 → 7
3 → 6 → 7
1 → 10 → 11 → 12 → 13
10 → 14 → 15 → 16
8, 12, 15 → 17 → 18
```

## Notes

- Tasks 1–9 (fluxo do aluno) estão concluídas.
- Tasks 10–18 (admin) dependem também de `design-system-tailwind-migration` tasks 3–4 (shadcn) para estilos corretos.
- `pages/PlayerPage.tsx` ainda importa o CSS Module indiretamente via componentes v1 — a task 9 limpa isso.
