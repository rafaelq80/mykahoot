# Requirements — Refatoração da Arquitetura de Componentes (Frontend)

## Contexto

A v1 concentra roteamento, estado, efeitos de socket e JSX em componentes únicos:
`PlayerPage.tsx` (381 linhas), `AdminDashboardPage.tsx` (334 linhas) e
`AdminQuizzesPage.tsx` (432 linhas). Isso dificulta teste, reuso e leitura. Esta spec
define a separação de responsabilidades para essas três telas (e o padrão a seguir
para telas futuras).

## Requisitos

### R1 — Página como composição, não como implementação

- QUANDO um desenvolvedor abrir qualquer arquivo em `src/pages/`, O SISTEMA DEVE
  apresentar um componente que só importa e compõe componentes de `features/` e
  `components/shared/`, sem `useState` de domínio nem `socket.on` direto.
- SE um componente de `pages/` ultrapassar 80 linhas, ENTÃO O SISTEMA DEVE sinalizar
  (via revisão/hook) que lógica precisa ser extraída para `features/`.

### R2 — `PlayerPage` dividido por etapa do jogo

- O SISTEMA DEVE substituir `PlayerPage.tsx` por rotas/telas distintas:
  `JoinRoomPage`, `LobbyPage`, `QuestionPage`, `ResultPage`, `PodiumPage`, cada uma
  renderizando componentes de `features/player-session`, `features/question-flow` e
  `features/ranking`.
- QUANDO o estado do jogo (`useGameStore`) mudar de fase (`lobby` →
  `pergunta_ativa` → `mostrando_resultado` → `finalizado`), O SISTEMA DEVE navegar
  automaticamente para a tela correspondente, sem o usuário precisar clicar em nada.

### R3 — `AdminDashboardPage` dividido por área de controle

- O SISTEMA DEVE extrair de `AdminDashboardPage.tsx` no mínimo os seguintes
  componentes de `features/admin-control`: `RoomStatusPanel` (aberta/fechada +
  contagem de jogadores), `QuestionControlPanel` (botão de avançar pergunta / abrir
  sala), `LiveAnswersCounter`, `FullScoreboardTable`.
- O SISTEMA DEVE mover toda assinatura de evento de socket do dashboard para um hook
  `useAdminGameSocket` dentro de `features/admin-control/hooks`.

### R4 — `AdminQuizzesPage` dividido por responsabilidade de CRUD

- O SISTEMA DEVE separar `AdminQuizzesPage.tsx` em: listagem (`QuizList`), formulário
  de quiz (`QuizForm`), formulário de pergunta (`QuestionForm`, incluindo upload de
  imagem) e formulário de tema (`ThemeForm`), todos em `features/quiz-editor`.
- QUANDO um formulário for submetido, O SISTEMA DEVE delegar a chamada HTTP a um hook
  dedicado (`useCreateQuiz`, `useUpdateQuestion`, etc.) que vive em
  `features/quiz-editor/hooks`, nunca diretamente no componente de formulário.

### R5 — Não regressão funcional

- QUANDO a refatoração for concluída, O SISTEMA DEVE preservar exatamente o mesmo
  comportamento observável (fluxo de jogo, CRUD, autenticação) que existia antes —
  esta é uma spec de reestruturação interna, não de novo comportamento.

## Fora de escopo

- Mudança de biblioteca de roteamento.
- Qualquer alteração de contrato de API/eventos de socket (isso é coberto pelas specs
  de sala única, música e upload de imagem).
