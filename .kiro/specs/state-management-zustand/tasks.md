# Implementation Plan: Estado Global com Zustand

## Overview

Introduzir Zustand como única fonte de verdade para estado global no frontend. Substituir `useGame.ts` e `useAdmin.ts` (hooks ad-hoc com estado disperso) por stores por domínio. O socket escreve direto na store via listeners registrados fora da árvore React.

## Tasks

- [x] 1. Instalar `zustand`
- [x] 2. Criar `stores/useGameStore.ts` com shape completo (screen, playerCount, playerInfo, question, questionResult, finalResult, timer, hasAnswered, selectedIndex, errorMessage) e todas as actions (handleEstado, handlePergunta, handleResultado, handleFim, answer, reset)
- [ ] 3. Criar `stores/useAdminStore.ts` com shape (screen, players, currentQuestionIndex, timer, answeredCount, ranking, finalRanking, correctIndex, errorMessage) e actions correspondentes
- [ ] 4. Criar `stores/useRoomStore.ts` (isOpen, closedReason — coordenar com spec `room-lifecycle-single-room`)
- [ ] 5. Criar `stores/useSettingsStore.ts` com middleware `persist` para musicEnabled/volume (coordenar com spec `game-background-music`)
- [x] 6. Criar `features/player-session/hooks/usePlayerSocket.ts` que registra listeners de socket e delega para `useGameStore` — substituindo a lógica do `useGame.ts`
- [x] 7. Migrar páginas do aluno (`JoinRoomPage`, `LobbyPage`, `QuestionPage`, `ResultPage`, `PodiumPage`) para ler de `useGameStore` com seletores granulares
- [ ] 8. Criar `features/admin-control/hooks/useAdminSocket.ts` e migrar dashboard do professor para ler de `useAdminStore`
- [ ] 9. Remover `hooks/useGame.ts` e `hooks/useAdmin.ts` após validar equivalência funcional
- [ ] 10. Implementar seletores derivados utilitários: `useCurrentQuestion`, `useTimeLeft`, `useSelfScore`
- [ ] 11. Testes unitários das actions de cada store (mocks de payload, sem socket real)

## Task Dependency Graph

```
1 → 2 → 6 → 7
1 → 3 → 8 → 9
1 → 4
1 → 5
7, 8 → 9
2, 3, 4, 5 → 10
10 → 11
```

## Notes

- Seletores granulares são obrigatórios: `useGameStore((s) => s.currentQuestion)`, nunca desestruturar toda a store.
- `useGame.ts` e `useAdmin.ts` só devem ser deletados após as respectivas pages migrarem — evitar quebra do build intermediário.
- `useSettingsStore` precisa de `persist` para sobreviver a reload (preferências de música).
