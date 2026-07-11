# Implementation Plan: Sala Única com Gate de Entrada

## Overview

Implementar a regra de sala única: alunos só entram quando o professor abriu a sala; se fechada, veem tela de espera com retry automático; fechar a sala desconecta todos os alunos imediatamente com mensagem clara.

## Tasks

### Backend

- [ ] 1. Criar `backend/src/game/game-room.service.ts` com `abrirSala(quizId, sessionId)`, `fecharSala()`, `isRoomActive(): boolean`
- [ ] 2. Confirmar que `GameStateService.resetar()` limpa `players`, `currentQuestionIndex`, `gameSessionId`, `status → inativo`
- [ ] 3. Adicionar handlers `admin:abrirSala` e `admin:fecharSala` em `game.gateway.ts`, delegando ao `GameRoomService`; bloquear dupla abertura com erro
- [ ] 4. Emitir `game:salaStatus { isOpen: boolean }` em broadcast nas transições abrir/fechar e em `handleConnection` (estado atual para recém-conectados)
- [ ] 5. Ao fechar sala: iterar `server.in('players').fetchSockets()`, emitir `game:salaFechada { reason: string }` e desconectar cada socket
- [ ] 6. Atualizar `GameSession.status` para `interrompida` quando sala for fechada antes do fim natural
- [ ] 7. Atualizar `game.types.ts` com `SalaStatusPayload` e `SalaFechadaPayload`
- [ ] 8. Testes: abrir sala → jogador entra; sala fechada → jogador rejeitado; fechar com jogadores → todos recebem `game:salaFechada`

### Frontend

- [ ] 9. Atualizar `frontend/src/types/events.ts` com `SalaStatusEvent` e `SalaFechadaEvent`
- [ ] 10. Criar `stores/useRoomStore.ts` (`isOpen`, `closedReason`, `setOpen`, `setClosed`)
- [ ] 11. Registrar listeners `game:salaStatus` e `game:salaFechada` em `usePlayerSocket` / `useAdminSocket`
- [ ] 12. Criar `features/player-session/components/WaitingForRoomScreen.tsx` (tela "Aguarde o professor abrir a sala" com spinner)
- [ ] 13. Criar `features/player-session/components/RoomGate.tsx` — renderiza `WaitingForRoomScreen` se `!isOpen`, senão `JoinRoomForm`
- [ ] 14. Usar `RoomGate` em `JoinRoomPage` para envolver o formulário
- [ ] 15. Criar `features/admin-control/components/RoomStatusPanel.tsx` com botão contextual Abrir/Fechar Sala + `Dialog` de confirmação para fechar
- [ ] 16. Integrar `RoomStatusPanel` no `AdminDashboardPage` vinculado a `useAdminStore`

## Task Dependency Graph

```
1 → 3 → 4 → 5 → 6 → 7 → 8
2 → 3
7 → 9 → 10 → 11 → 12 → 13 → 14
11 → 15 → 16
```

## Notes

- Backend tasks 1–8 são pré-requisito para todas as frontend tasks.
- `useRoomStore` (task 10) deve ser coordenado com `state-management-zustand` task 4.
- `RoomGate` precisa do `useRoomStore` para saber se exibe o form ou a tela de espera.
