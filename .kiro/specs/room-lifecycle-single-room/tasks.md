# Implementation Plan: Sala Única — Ciclo de Vida

## Overview

Regra de negócio central: apenas uma sala ativa por vez. Controle completo do ciclo
de vida via WebSocket (abrir, entrar, jogar, encerrar). Implementação consolidada
em `GameStateService` + `GameGateway` + `GameResultsService`.

## Tasks

### Backend — Estado e transições

- [x] 1. Implementar `GameStateService` com estado singleton em memória: status, players (Map), quizId, gameSessionId, currentQuestionIndex, questionTimer
- [x] 2. Implementar `abrirSala(quizId, sessionId)` com guard `status !== 'inativo'` → ConflictException
- [x] 3. Implementar `adicionarJogador()` com guard `status !== 'lobby'` + duplicidade por alunoId → BadRequest/Conflict
- [x] 4. Implementar `registrarResposta()` com detecção de "todos responderam"
- [x] 5. Implementar `calcularResultadoPergunta()` com pontuação por velocidade (BASE_POINTS/MIN_CORRECT_POINTS)
- [x] 6. Implementar `avancarPergunta()` retornando bool se há mais perguntas
- [x] 7. Implementar `removerJogador()` (desconexão) com recálculo de "todos responderam"
- [x] 8. Implementar `resetar()` voltando tudo para inativo + limpando timer/players

### Backend — Gateway (eventos)

- [x] 9. Handler `admin:conectar` — admin entra na sala 'admins', recebe estado atual
- [x] 10. Handler `admin:selecionarTema` — cria GameSession, carrega perguntas, abre sala, emite broadcast
- [x] 11. Handler `admin:liberarPergunta` — transiciona para pergunta_ativa, agenda timer, emite game:pergunta
- [x] 12. Handler `admin:proximaPergunta` — avança pergunta ou finaliza se última
- [x] 13. Handler `admin:finalizarJogo` — encerra jogo a qualquer momento (processa resultado pendente se necessário)
- [x] 14. Handler `admin:encerrarSala` — fecha sala forçadamente: emite game:salaEncerrada, reseta estado, marca sessão como interrompida
- [x] 15. Handler `player:entrar` — valida turma/aluno via AlunoService, cria PlayerResult, adiciona ao estado
- [x] 16. Handler `player:responder` — registra resposta, aciona resultado antecipado se todos responderam
- [x] 17. `handleConnection` — emite game:estado com status atual para recém-conectados
- [x] 18. `handleDisconnect` — remove jogador, emite estado, verifica "todos responderam"

### Backend — Persistência e recovery

- [x] 19. `GameResultsService.finalizarSessao()` — marca GameSession como 'finalizado' no banco
- [x] 20. `GameResultsService.onModuleInit()` — marca sessões 'em_andamento' como 'interrompida' ao startup

### Frontend — Tratamento de estados

- [x] 21. `usePlayerSocket` — listener `game:estado` drive screen (entry/lobby/question/result/podium)
- [x] 22. `usePlayerSocket` — listener `game:salaEncerrada` redireciona para entry com mensagem
- [x] 23. `useGameStore` — handleEstado limpa tudo ao receber status 'inativo'
- [x] 24. `useGameStore` — handleEstado com status 'lobby' + playerInfo → mostra lobby
- [x] 25. `useAdminSocket` — emite `admin:conectar` ao conectar para receber estado
- [x] 26. `useAdminStore` — handleEstado mapeia status do servidor para AdminScreen

### Pendente

- [x] 27. Retry automático: aluno reconecta e re-entra sem re-selecionar turma/avatar quando professor reabre sala (implementado via `lastJoinInfo` em sessionStorage + auto-emit de `player:entrar` quando `game:estado` chega com `status: 'lobby'`)
- [ ] 28. Decisão arquitetural: extrair lógica de sala para `game-room.service.ts` separado ou manter em `GameStateService` (apenas refactoring interno, sem impacto funcional)
- [ ] 29. Testes unitários: `GameStateService` (abrirSala com conflito, adicionarJogador com duplicidade, registrarResposta com todos responderam, resetar)
- [ ] 30. Testes e2e: fluxo completo admin:encerrarSala com jogadores conectados → todos recebem game:salaEncerrada
- [ ] 31. Testes e2e: aluno tenta entrar com sala fechada → recebe game:erro
- [ ] 32. Frontend: tela explícita "Aguardando o professor abrir a sala" com indicador visual (hoje mostra entry genérica quando status === 'inativo')

## Task Dependency Graph

```
1 → 2, 3, 4, 5, 6, 7, 8
2 → 10
3 → 15
4, 5, 6 → 11, 12, 16
7 → 18
8 → 14
10, 11, 12, 13, 14, 15, 16 → 17, 18
19, 20
21, 22, 23, 24 → 25, 26
27, 28, 29, 30, 31, 32
```

## Notes

- Tasks 1–26 estão implementadas e em produção.
- Tasks 27–32 são dívida técnica ou melhorias planejadas.
- `game-room.service.ts` (task 28) é uma decisão de refactoring — a lógica funciona consolidada em GameStateService; separar é opcional e só melhora organização.
- Task 32 (tela "aguardando sala") distinguiria visualmente "nenhuma sala existe" de "sala existiu mas você ainda não entrou" — hoje ambos mostram a mesma tela de entry.
