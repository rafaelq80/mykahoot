# Requirements: QuizLive MVP

## Introdução

QuizLive é uma aplicação web no estilo Kahoot, no ritmo do professor (não há contagem de tempo automática que avança o jogo sozinho — o professor decide quando liberar cada pergunta). Apenas uma sala/partida ativa por vez no sistema, quizzes organizados por temas, jogadores entram sem cadastro (nickname + avatar), e os resultados finais são persistidos no banco.

## Requisitos

### Requisito 1: Gestão de Temas e Quizzes

**User Story:** Como professor, eu quero organizar minhas perguntas em temas e quizzes, para que eu possa reutilizá-los em diferentes aulas.

#### Critérios de Aceite
1. WHEN o professor acessa o dashboard, THEN o sistema SHALL exibir a lista de temas e seus quizzes cadastrados.
2. WHEN o professor cria um novo quiz, THEN o sistema SHALL permitir associá-lo a um tema existente ou criar um novo tema.
3. WHEN o professor adiciona uma pergunta, THEN o sistema SHALL permitir texto, 4 alternativas, indicação da correta, tempo limite (opcional) e upload de imagem via ImageKit.

### Requisito 2: Sala Única

**User Story:** Como sistema, eu quero garantir que exista apenas uma partida ativa por vez, para simplificar o gerenciamento de estado e a experiência dos jogadores.

#### Critérios de Aceite
1. WHEN já existe uma partida em andamento (status diferente de "finalizado" ou "inativo"), THEN o sistema SHALL impedir o início de uma nova partida.
2. WHEN o professor seleciona um tema/quiz e clica em "Abrir sala", THEN o sistema SHALL criar um estado de jogo em memória com status "lobby".

### Requisito 3: Entrada de Jogadores

**User Story:** Como jogador, eu quero entrar na sala apenas com um nickname e um avatar, sem precisar criar conta, para participar rapidamente.

#### Critérios de Aceite
1. WHEN um jogador acessa a tela de entrada e a sala está em "lobby", THEN o sistema SHALL permitir que ele informe um nickname e escolha um avatar (de uma lista pré-definida).
2. WHEN o jogador confirma a entrada, THEN o sistema SHALL adicioná-lo ao estado em memória (sem gravar no banco) e notificar via WebSocket todos os clientes conectados (dashboard e jogadores) sobre a lista atualizada.
3. IF a sala não estiver em "lobby" (já em andamento ou inexistente), THEN o sistema SHALL impedir a entrada e exibir mensagem apropriada.

### Requisito 4: Fluxo da Partida Controlado pelo Professor

**User Story:** Como professor, eu quero controlar manualmente quando cada pergunta é liberada, e que o sistema cuide do tempo de resposta e da exibição do resultado de cada pergunta, para seguir o ritmo da minha aula sem me preocupar com correção manual.

#### Critérios de Aceite
1. WHEN o professor clica em "Iniciar pergunta N", THEN o sistema SHALL enviar a pergunta (texto, imagem, alternativas, tempo limite) a todos os jogadores via WebSocket, sem revelar a alternativa correta, e SHALL iniciar uma contagem regressiva igual ao `timeLimitSec` da pergunta.
2. WHEN um jogador responde, THEN o sistema SHALL registrar a resposta e o tempo de resposta no estado em memória, e SHALL ignorar qualquer resposta adicional do mesmo jogador para a mesma pergunta.
3. WHEN o jogador envia uma resposta, THEN o front-end SHALL desabilitar imediatamente as opções de resposta daquela pergunta, sem aguardar confirmação do servidor.
4. WHEN o tempo limite da pergunta se esgota OU todos os jogadores conectados já responderam (o que ocorrer primeiro), THEN o sistema SHALL automaticamente calcular a pontuação de cada jogador conforme a fórmula definida em `design.md` (acerto + bônus por velocidade), atualizar o placar, revelar a alternativa correta a todos e indicar a cada jogador se a sua resposta (ou ausência de resposta) estava correta.
5. WHEN o placar é exibido após cada pergunta, THEN o sistema SHALL enviar a cada jogador apenas o top 5 do placar atual junto com a posição e pontuação do próprio jogador (mesmo que fora do top 5), e SHALL enviar ao dashboard do professor o placar completo.
6. WHEN o resultado da pergunta é exibido, THEN o sistema SHALL aguardar a ação do professor ("Próxima pergunta") antes de exibir a pergunta seguinte — não há avanço automático entre perguntas.
7. WHEN o professor clica em "Próxima pergunta" na última pergunta do quiz, THEN o sistema SHALL encerrar a partida e seguir para o ranking final (Requisito 5).

### Requisito 5: Persistência dos Resultados e Ranking Final

**User Story:** Como professor e como jogador, eu quero que ao final da partida sejam exibidos os resultados — o professor vendo o ranking completo e os alunos vendo o top 5 e sua própria posição — e que os resultados sejam salvos para consulta posterior.

#### Critérios de Aceite
1. WHEN a partida é finalizada, THEN o sistema SHALL persistir no Neon: a sessão de jogo (quiz, data) e, para cada jogador, nickname, avatar, score final e respostas detalhadas.
2. WHEN a partida é finalizada, THEN o sistema SHALL enviar aos jogadores o top 5 do ranking final junto com a posição e pontuação do próprio jogador, mesmo que ele não esteja entre os 5 primeiros.
3. WHEN a partida é finalizada, THEN o sistema SHALL enviar ao dashboard do professor o ranking completo de todos os jogadores.
4. WHEN a partida é finalizada, THEN o sistema SHALL limpar o estado em memória e voltar ao status "inativo", liberando para uma nova sala.

### Requisito 6: Dashboard do Professor

**User Story:** Como professor, eu quero um painel que mostre o que está acontecendo em tempo real e o histórico de partidas, para acompanhar a turma.

#### Critérios de Aceite
1. WHEN o professor está logado no dashboard, THEN o sistema SHALL exibir em tempo real: jogadores conectados, pergunta atual, placar e controles de avanço.
2. WHEN o professor acessa o histórico, THEN o sistema SHALL exibir as sessões de jogo anteriores e seus resultados (vindos do Neon), incluindo o status de cada sessão ("finalizado" ou "interrompida").

### Requisito 7: Persistência Incremental e Resiliência

**User Story:** Como professor, eu quero que o progresso da partida seja salvo continuamente, para que uma eventual queda do sistema não cause perda total dos resultados já obtidos pelos alunos.

#### Critérios de Aceite
1. WHEN o professor abre a sala (status `lobby`), THEN o sistema SHALL criar uma `GameSession` no Neon com `status = 'em_andamento'`.
2. WHEN um jogador entra na sala, THEN o sistema SHALL criar imediatamente um `PlayerResult` associado à `GameSession`, com `score = 0` e `answers` vazio.
3. WHEN o resultado de uma pergunta é calculado, THEN o sistema SHALL atualizar (upsert) o `PlayerResult` de cada jogador com o `score` acumulado e a resposta dada nessa pergunta.
4. WHEN a partida é finalizada, THEN o sistema SHALL atualizar a `GameSession` para `status = 'finalizado'`.
5. IF o backend reiniciar e encontrar uma `GameSession` com `status = 'em_andamento'`, THEN o sistema SHALL atualizá-la para `status = 'interrompida'` e SHALL NOT tentar restaurar o estado em memória da partida anterior.
