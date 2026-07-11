# Requirements — Sala Única com Gate de Entrada

## Contexto

O sistema já impede entrada de jogador fora do status `lobby`
(`backend/src/game/game.gateway.ts`, handler `player:entrar`), mas isso hoje é um
efeito colateral do fluxo de seleção de quiz (`admin:selecionarTema`), não uma ação
explícita e nomeada de "abrir sala". Também não existe hoje um evento que force a
saída de todos os jogadores quando o professor decide interromper a sessão antes do
fim do jogo. Esta spec formaliza as duas pontas: abertura/fechamento explícitos da
sala pelo professor, e a experiência de espera/expulsão do aluno.

## Requisitos

### R1 — Abertura explícita da sala

- QUANDO o professor selecionar um quiz e confirmar "Abrir Sala", O SISTEMA DEVE
  emitir `admin:abrirSala` com o `quizId`, criar a `GameSession` no banco, definir
  `status = 'lobby'` e permitir a entrada de jogadores a partir desse momento.
- ENQUANTO não houver uma sala aberta (`status` fora de `lobby` a
  `mostrando_resultado`/`finalizado` de uma sessão em andamento), O SISTEMA DEVE
  rejeitar `player:entrar` com uma mensagem clara de "sala fechada".

### R2 — Tela de espera do aluno

- QUANDO um aluno acessar a aplicação e a sala estiver fechada, O SISTEMA DEVE exibir
  uma tela de espera ("Aguarde o professor abrir a sala") em vez do formulário de
  nickname/avatar.
- ENQUANTO a tela de espera estiver visível, O SISTEMA DEVE verificar
  periodicamente/reativamente (via evento de socket `game:salaStatus`, não polling
  HTTP) se a sala abriu, e QUANDO abrir, O SISTEMA DEVE liberar automaticamente o
  formulário de entrada, sem exigir reload da página.

### R3 — Fechamento explícito e expulsão

- QUANDO o professor confirmar "Fechar Sala" (em um diálogo de confirmação, por ser
  destrutivo), O SISTEMA DEVE emitir `admin:fecharSala`, o backend DEVE marcar a
  `GameSession` como `interrompida` (se o jogo não havia terminado) ou manter
  `finalizado` (se já havia terminado normalmente), desconectar/expulsar todos os
  sockets na room `players`, e resetar o estado em memória (`GameStateService`).
- QUANDO um jogador for expulso por fechamento de sala, O SISTEMA DEVE emitir
  `game:salaFechada` com um motivo (`admin_fechou`), e o cliente DEVE redirecionar o
  aluno para a tela inicial exibindo uma mensagem explicando que o professor encerrou
  a sessão.

### R4 — Sala única (não simultânea)

- SE o professor tentar abrir uma nova sala enquanto outra já está com `status`
  diferente de `inativo`/`finalizado`/`interrompida`, ENTÃO O SISTEMA DEVE bloquear a
  ação e exibir um aviso ("Encerre a sala atual antes de abrir uma nova"), pois só
  pode existir uma sessão de jogo ativa no processo.

### R5 — Reconexão

- SE um aluno perder a conexão de socket temporariamente enquanto a sala está aberta
  e reconectar antes do fim da pergunta atual, O SISTEMA DEVE preservar seu
  comportamento atual (já implementado em `game.gateway.ts` para desconexão durante
  `pergunta_ativa`) — esta spec não altera essa lógica, só a formaliza como não
  regressão.

## Fora de escopo

- Múltiplas salas simultâneas.
- Reconexão automática do professor ao dashboard após fechar o navegador (ele
  reautentica normalmente).
