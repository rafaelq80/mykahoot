# Tasks: QuizLive MVP

- [x] 1. Setup do monorepo
  - Criar projeto NestJS em `/backend` e projeto React/Vite em `/frontend`
  - Configurar variáveis de ambiente (Neon `DATABASE_URL`, credenciais ImageKit, segredo JWT)
  - _Requisitos: base para todos os demais_

- [x] 2. Configurar Prisma e Neon
  - Criar `schema.prisma` conforme `design.md` (Theme, Quiz, Question, GameSession com campo `status`, PlayerResult)
  - Gerar migration inicial e validar conexão pooled com o Neon
  - _Requisitos: 1, 5, 7_

- [x] 3. Implementar ThemeModule
  - Endpoints REST `GET/POST/PATCH/DELETE /themes`
  - Validação básica (DTOs com class-validator)
  - _Requisitos: 1_

- [x] 4. Implementar QuizModule
  - Endpoints REST para `/quizzes` e `/quizzes/:id/questions` (CRUD)
  - Endpoint `GET /imagekit/auth` retornando parâmetros assinados para upload
  - _Requisitos: 1_

- [x] 5. Implementar AdminModule (autenticação)
  - Endpoint de login com senha via variável de ambiente
  - Emissão e validação de JWT, guard para proteger rotas do dashboard
  - _Requisitos: 6_

- [x] 6. Implementar GameStateService
  - Estrutura de estado em memória conforme `design.md` (incluindo `gameSessionId` e `playerResultId` por jogador)
  - Métodos: abrirSala, adicionarJogador, registrarResposta, calcularResultadoPergunta, avancarPergunta, finalizarJogo, resetar
  - Validações: impedir abrir sala se já houver partida ativa; impedir entrada fora do lobby
  - _Requisitos: 2, 3, 4, 7_

- [x] 7. Implementar GameGateway (WebSocket)
  - Implementar `admin:selecionarTema` (cria `GameSession` com `status='em_andamento'`), `admin:liberarPergunta`, `admin:proximaPergunta`, `player:entrar` (cria `PlayerResult` inicial), `player:responder`
  - Implementar timer por pergunta (`setTimeout` baseado em `timeLimitSec`) que dispara o cálculo automático do resultado
  - Implementar verificação de "todos responderam" após cada `player:responder`, cancelando o timer e disparando o resultado antecipadamente quando aplicável
  - Implementar cálculo de pontuação por pergunta conforme fórmula em `design.md` (BASE_POINTS/MIN_CORRECT_POINTS), o ranking ordenado, e o **upsert do `PlayerResult`** de cada jogador (score acumulado + respostas)
  - Organizar sockets em duas salas: `players` e `admins`
  - Emitir `game:pergunta`/`game:estado` por broadcast; emitir `game:resultadoPergunta`/`game:fim` individualmente para cada jogador (com `top5` + `you`); emitir `admin:placar`/`admin:fim`/`admin:estado` para a sala `admins` (ranking completo)
  - Tratar desconexão de jogadores (remover do estado, notificar demais, recalcular "todos responderam" se necessário)
  - _Requisitos: 2, 3, 4, 5, 7_

- [x] 8. Implementar GameResultsService
  - Lógica de pontuação (acerto + bônus por velocidade de resposta), compartilhada com o `GameGateway` para os upserts incrementais
  - Acionado pelo `GameGateway` quando `admin:proximaPergunta` é chamado na última pergunta: atualiza `GameSession.status = 'finalizado'`
  - Resetar `GameStateService` (incluindo `gameSessionId`) após a atualização bem-sucedida
  - Implementar verificação no `onModuleInit`: se existir `GameSession` com `status = 'em_andamento'`, atualizar para `status = 'interrompida'`
  - _Requisitos: 4, 5, 7_

- [ ] 9. Frontend: tela do jogador
  - Tela de entrada (nickname + seleção de avatar)
  - Conexão via socket.io-client, escuta de `game:estado`, `game:pergunta`, `game:resultadoPergunta`, `game:fim`
  - Tela de pergunta com contagem regressiva visual baseada em `timeLimitSec`
  - Ao responder, desabilitar imediatamente as alternativas (estado local), sem aguardar o servidor
  - Tela de resultado da pergunta: indicar acerto/erro do jogador (`you.correct`), mostrar a alternativa correta, a pontuação/posição do jogador (`you`) e o top 5 (`top5`)
  - Tela de ranking final exibida a todos ao receber `game:fim`, mostrando o top 5 (`top5`) e a posição/pontuação final do jogador (`you`)
  - _Requisitos: 3, 4, 5_

- [~] 10. Frontend: dashboard do professor
  - Tela de login
  - Tela principal: seleção de tema/quiz, botões de controle (liberar pergunta, próxima pergunta), contagem regressiva e lista de jogadores em tempo real
  - Escutar `admin:estado`, `admin:placar` e `admin:fim` para exibir o placar/ranking completo (não limitado ao top 5)
  - _Requisitos: 4, 5, 6_

- [~] 11. Frontend: CRUD de temas/quizzes/perguntas
  - Telas de gestão de temas, quizzes e perguntas
  - Upload de imagem direto para ImageKit usando `/imagekit/auth`
  - _Requisitos: 1_

- [~] 12. Frontend: histórico de partidas
  - Tela listando `GameSession` anteriores (com status `finalizado` ou `interrompida`) e detalhes de `PlayerResult`
  - _Requisitos: 6, 7_

- [~] 13. Deploy
  - Backend como Web Service no Render (configurar build/start, variáveis de ambiente, CORS)
  - Frontend como Static Site no Render
  - Configurar ping externo (cron-job.org) para reduzir cold start do backend
  - _Requisitos: todos_
