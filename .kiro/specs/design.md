# Design: QuizLive MVP

## Visão Geral

Aplicação cliente-servidor com NestJS (REST + WebSocket) no backend, React (Vite) no frontend, Postgres (Neon) para persistência e ImageKit para hospedagem de imagens. O estado da partida ativa vive em memória no processo do backend (singleton), já que existe apenas uma sala por vez — isso elimina a necessidade de Redis ou de lógica de múltiplas salas no MVP.

## Arquitetura

```
[React + socket.io-client] <---HTTP/REST---> [NestJS API]
        |                                          |
        |<------ WebSocket (Socket.io) ----------->|
                                                    |
                                            [Prisma ORM]
                                                    |
                                            [Neon Postgres]

Upload de imagens: Frontend (dashboard) -> ImageKit (direto), URL salva via REST
```

### Stack
- Backend: NestJS (TypeScript) + `@nestjs/websockets` (adapter Socket.io)
- ORM: Prisma
- Banco: Neon Postgres (connection string pooled)
- Frontend: React (Vite) + socket.io-client
- Imagens: ImageKit (upload client-side com autenticação assinada pelo backend)
- Hospedagem: Render — Web Service (backend) + Static Site (frontend)

## Componentes e Interfaces

### Módulos NestJS

- **ThemeModule** — CRUD de temas (REST: `GET/POST/PATCH/DELETE /themes`)
- **QuizModule** — CRUD de quizzes e perguntas (REST: `/quizzes`, `/quizzes/:id/questions`), incluindo endpoint `GET /imagekit/auth` para gerar parâmetros de upload assinado
- **GameModule**
  - `GameStateService` — singleton em memória representando a sala única
  - `GameGateway` — WebSocket gateway (eventos detalhados abaixo)
  - `GameResultsService` — calcula pontuação e persiste resultado final
- **AdminModule** — autenticação simples do dashboard (login com senha via variável de ambiente, emite JWT)

### Estado em Memória (`GameStateService`)

```typescript
type GameStatus = 'inativo' | 'lobby' | 'pergunta_ativa' | 'mostrando_resultado' | 'finalizado';

interface PlayerState {
  socketId: string;
  playerResultId: string; // id do PlayerResult já criado no Neon para este jogador
  nickname: string;
  avatar: string;
  score: number;
  answers: Map<string, { selectedIndex: number; timeMs: number; correct: boolean }>; // questionId -> resposta
}

interface GameState {
  status: GameStatus;
  gameSessionId: string | null; // id da GameSession criada no Neon ao abrir a sala
  quizId: string | null;
  currentQuestionIndex: number;
  questionStartedAt: number | null; // timestamp, usado para calcular timeMs
  questionTimer: NodeJS.Timeout | null; // dispara mostrarResultado automaticamente ao fim do timeLimitSec
  players: Map<string, PlayerState>; // socketId -> player
}
```

### Lógica de Tempo e Encerramento Automático da Pergunta

- Ao receber `admin:selecionarTema`, o `GameStateService`:
  1. Cria uma `GameSession` no Neon com `status = 'em_andamento'` e guarda `gameSessionId`.
  2. Define `status = 'lobby'`, `quizId`, `currentQuestionIndex = 0`.
- Ao receber `player:entrar` (sala em `lobby`), o `GameStateService`:
  1. Cria um `PlayerResult` no Neon associado ao `gameSessionId`, com `score = 0` e `answers = []`, e guarda o `id` retornado como `playerResultId`.
  2. Adiciona o jogador ao `players` (Map em memória) com esse `playerResultId`.
- Ao receber `admin:liberarPergunta`, o `GameStateService`:
  1. Define `status = 'pergunta_ativa'`, `questionStartedAt = Date.now()`.
  2. Agenda `questionTimer` com `setTimeout(timeLimitSec * 1000)` que, ao disparar, chama internamente o mesmo fluxo de `admin:mostrarResultado`.
- A cada `player:responder` aceito, o serviço verifica se `players.size > 0` e todos os jogadores conectados já têm resposta registrada para a pergunta atual; se sim, cancela `questionTimer` (`clearTimeout`) e dispara imediatamente o fluxo de `mostrarResultado`.
- O fluxo de "mostrarResultado" (disparado pelo timeout OU por todos terem respondido):
  1. Para cada jogador sem resposta registrada, considera resposta inválida (`selectedIndex: -1`, `correct: false`).
  2. Calcula `correct` e `pointsEarned` por jogador, soma ao `score`.
  3. Para cada jogador, faz **upsert** do `PlayerResult` (`id = playerResultId`) no Neon, atualizando `score` e `answers` (acrescentando a resposta desta pergunta ao array).
  4. Define `status = 'mostrando_resultado'`.
  5. Emite `game:resultadoPergunta` para todos (ver payload abaixo).
- O avanço para a próxima pergunta (ou para o fim do jogo) só ocorre via `admin:proximaPergunta`, nunca automaticamente.

### Persistência Incremental e Resiliência

A cada pergunta, o placar acumulado de cada jogador já está salvo no Neon (passo 3 do fluxo acima), então uma queda do servidor no meio da partida não perde os pontos já conquistados — eles ficam registrados na `GameSession` (status `em_andamento`) e seus `PlayerResult`.

O custo extra é mínimo: para uma partida com ~40 alunos e ~10 perguntas, são ~400 upserts pequenos no total — bem dentro do que o Neon free tier suporta, e os writes mantêm o banco "aquecido" durante a partida, evitando o cold start de suspensão.

**Limitação assumida no MVP**: se o servidor reiniciar/cair no meio da partida, o estado em memória (`GameStateService`) e as conexões WebSocket são perdidos. Não há reconexão automática dos jogadores ao ponto exato da partida. Ao iniciar (`onModuleInit`), o backend verifica se existe alguma `GameSession` com `status = 'em_andamento'` e, se houver, atualiza para `status = 'interrompida'` — preservando os dados parciais no histórico, mas exigindo que o professor abra uma nova sala e os alunos reentrem do zero. Reconexão de estado é considerada melhoria futura, fora do escopo do MVP.

### Eventos WebSocket

**Professor → Servidor**
| Evento | Payload | Efeito |
|---|---|---|
| `admin:selecionarTema` | `{ quizId }` | Abre sala (status: `lobby`) |
| `admin:liberarPergunta` | — | Envia pergunta atual e inicia o timer (status: `pergunta_ativa`) |
| `admin:proximaPergunta` | — | Avança índice e libera a próxima pergunta (status: `pergunta_ativa`), ou finaliza o jogo se era a última |

**Jogador → Servidor**
| Evento | Payload | Efeito |
|---|---|---|
| `player:entrar` | `{ nickname, avatar }` | Valida e adiciona ao estado |
| `player:responder` | `{ questionId, selectedIndex }` | Registra resposta (ignora duplicadas); se todos responderam, dispara resultado imediatamente |

**Servidor → Jogadores** (broadcast para a sala `players`)
| Evento | Payload | Quando |
|---|---|---|
| `game:estado` | snapshot (status, contagem de jogadores) | A cada mudança relevante de estado |
| `game:pergunta` | `{ questionId, text, imageUrl, options, timeLimitSec }` (sem `correctIndex`) | Ao liberar pergunta (manual ou via "próxima") |
| `game:resultadoPergunta` | `{ correctIndex, top5: [{ nickname, avatar, score }], you: { correct, selectedIndex, score, position } }` | Automático: ao esgotar o tempo OU todos responderem |
| `game:fim` | `{ top5: [{ nickname, avatar, score }], you: { score, position } }` | Ao finalizar a última pergunta via `admin:proximaPergunta` |

**Servidor → Dashboard do Professor** (broadcast para a sala `admins`)
| Evento | Payload | Quando |
|---|---|---|
| `admin:estado` | snapshot completo (status, jogadores conectados, pergunta atual) | A cada mudança relevante de estado |
| `admin:placar` | `{ correctIndex, ranking: [{ socketId, nickname, avatar, score, correct, selectedIndex }] }` (ranking completo) | Mesmo gatilho de `game:resultadoPergunta` |
| `admin:fim` | `{ ranking: [{ nickname, avatar, score }] }` (ranking completo) | Mesmo gatilho de `game:fim` |

> Observação: `game:resultadoPergunta` e `game:fim` são emitidos individualmente para cada socket de jogador (`socket.emit`, não broadcast), pois o campo `you` é específico de cada jogador. O `top5` é o mesmo para todos. Já `admin:placar`/`admin:fim` são enviados (broadcast ou emit) apenas para os sockets na sala `admins`, com o ranking completo.

### Cálculo de Pontuação

Constantes:
- `BASE_POINTS = 1000` (pontuação máxima por pergunta, resposta correta no instante 0)
- `MIN_CORRECT_POINTS = 500` (pontuação mínima garantida por resposta correta, mesmo no último milissegundo)

Fórmula, aplicada por jogador e por pergunta:

```typescript
const timeLimitMs = timeLimitSec * 1000;
const timeMs = Math.min(answer.timeMs, timeLimitMs); // tempo até responder, limitado ao máximo
const remainingRatio = (timeLimitMs - timeMs) / timeLimitMs; // 1 = respondeu instantaneamente, 0 = no limite do tempo

const pointsEarned = answer.correct
  ? Math.round(MIN_CORRECT_POINTS + (BASE_POINTS - MIN_CORRECT_POINTS) * remainingRatio)
  : 0;
```

- Resposta incorreta ou ausente (jogador não respondeu a tempo) → `pointsEarned = 0`.
- `score` do jogador é a soma de `pointsEarned` de todas as perguntas, persistido em `PlayerResult.score` ao final.
- O `ranking` (ordenado por `score` desc) é recalculado a cada `pointsEarned`; `top5` é o slice dos 5 primeiros, e `position` de cada jogador é seu índice + 1 nesse ranking ordenado.

### Fluxo de Finalização

Quando `admin:proximaPergunta` é recebido e `currentQuestionIndex` já era o da última pergunta do quiz:
1. O resultado da última pergunta já foi calculado e persistido (upsert dos `PlayerResult`, conforme seção anterior).
2. `GameResultsService` calcula o ranking final a partir dos `score` já salvos e atualiza a `GameSession` para `status = 'finalizado'`.
3. `status = 'finalizado'` em memória, emite `game:fim` (top5 + posição individual) para cada jogador e `admin:fim` (ranking completo) para o dashboard.
4. O estado em memória é resetado (`status = 'inativo'`, `players` limpo, `gameSessionId = null`), liberando o dashboard para abrir uma nova sala.

## Modelo de Dados (Prisma)

```prisma
model Theme {
  id          String @id @default(uuid())
  name        String
  description String?
  quizzes     Quiz[]
}

model Quiz {
  id        String @id @default(uuid())
  themeId   String
  theme     Theme @relation(fields: [themeId], references: [id])
  title     String
  questions Question[]
  sessions  GameSession[]
}

model Question {
  id           String @id @default(uuid())
  quizId       String
  quiz         Quiz @relation(fields: [quizId], references: [id])
  text         String
  imageUrl     String?
  options      Json    // ["opção a", "opção b", "opção c", "opção d"]
  correctIndex Int
  timeLimitSec Int @default(20)
  order        Int
}

model GameSession {
  id       String @id @default(uuid())
  quizId   String
  quiz     Quiz @relation(fields: [quizId], references: [id])
  status   String @default("em_andamento") // "em_andamento" | "finalizado" | "interrompida"
  playedAt DateTime @default(now())
  results  PlayerResult[]
}

model PlayerResult {
  id            String @id @default(uuid())
  gameSessionId String
  session       GameSession @relation(fields: [gameSessionId], references: [id])
  nickname      String
  avatar        String
  score         Int
  answers       Json // [{questionId, selectedIndex, correct, timeMs, pointsEarned}]
}
```

## Estrutura do Frontend (React)

- `/` — tela do jogador, com sub-estados controlados pelo `status` recebido em `game:estado`/`game:pergunta`/`game:resultadoPergunta`/`game:fim`:
  - **Entrada**: nickname + seleção de avatar (somente se `status === 'lobby'` e jogador ainda não entrou)
  - **Espera**: aguardando o professor liberar a próxima pergunta
  - **Pergunta**: exibe texto, imagem, alternativas e contagem regressiva (`timeLimitSec`); ao responder, desabilita todas as opções imediatamente (estado local `respondido = true`), independente da confirmação do servidor
  - **Resultado da pergunta**: exibe se a resposta do jogador estava correta (`you.correct`), a alternativa correta, sua pontuação/posição (`you.score`/`you.position`) e o top 5 do placar (`top5`)
  - **Ranking final**: exibido a todos ao receber `game:fim`, com o top 5 (`top5`) e a posição/pontuação final do próprio jogador (`you`)
- `/admin/login` — login simples do professor
- `/admin` — dashboard: seleção de tema/quiz, botão "Liberar pergunta" / "Próxima pergunta", contagem regressiva, placar em tempo real, ranking final
- `/admin/quizzes` — CRUD de temas, quizzes e perguntas (upload ImageKit)
- `/admin/historico` — lista de `GameSession` anteriores com resultados

## Tratamento de Erros

- Conexão WebSocket perdida (jogador): exibir tela de "reconectando", manter nickname/avatar em memória local (React state) para tentar reentrar automaticamente se a sala ainda estiver na mesma pergunta.
- Tentativa de abrir nova sala com partida em andamento: backend retorna erro explícito (`game:erro`), dashboard exibe aviso.
- Falha ao persistir resultado final no Neon: logar erro, manter estado em memória até nova tentativa manual (evitar perda de dados da partida).

## Estratégia de Testes

- Testes unitários no `GameStateService` (transições de status, cálculo de pontuação).
- Testes e2e básicos nos endpoints REST de `ThemeModule`/`QuizModule` (CRUD).
- Teste manual do fluxo completo de partida com múltiplos clientes (2-3 abas) antes do deploy.
