# Requirements: Sala Única — Ciclo de Vida

## Introdução

Existe apenas uma sala de jogo ativa por vez no sistema. O professor abre a sala
para um quiz, alunos entram, o jogo acontece, e ao final (ou por encerramento
forçado) a sala volta ao estado inativo. Esta spec documenta todas as regras de
transição de estado, controle de entrada e encerramento.

## Estados possíveis (`GameStatus`)

| Estado                | Significado                                              |
|-----------------------|----------------------------------------------------------|
| `inativo`             | Nenhuma sala aberta. Sistema em repouso.                |
| `lobby`               | Sala aberta, aguardando jogadores e/ou início do jogo.  |
| `pergunta_ativa`      | Uma pergunta foi liberada e o timer está rodando.       |
| `mostrando_resultado` | Resultado da pergunta sendo exibido, aguardando avanço. |
| `finalizado`          | Jogo encerrado normalmente (todas as perguntas feitas). |

## Requisitos Funcionais

### RF-1: Apenas uma sala por vez

- QUANDO o professor tentar abrir uma sala (`admin:selecionarTema`) e já existir
  uma partida ativa (`status !== 'inativo'`), O SISTEMA DEVE rejeitar com erro
  `ConflictException` e mensagem clara.

### RF-2: Abertura de sala

- QUANDO o professor emite `admin:selecionarTema { quizId }`:
  - Cria `GameSession` no banco com `status: 'em_andamento'`
  - Carrega perguntas do quiz em memória
  - Transiciona estado para `lobby`
  - Emite `game:estado { status: 'lobby' }` em broadcast para todos os clientes

### RF-3: Entrada de aluno (gate)

- QUANDO um aluno tenta entrar (`player:entrar`) com sala em `lobby`:
  - Valida `{ turmaId, alunoId, avatar }` via `AlunoService.findAlunoInTurma`
  - Cria `PlayerResult` no banco vinculado ao aluno/turma
  - Adiciona jogador ao estado em memória (impede duplicidade por `alunoId`)
  - Emite `game:estado` atualizado
- QUANDO a sala NÃO está em `lobby`, o aluno recebe `game:erro` e não entra.

### RF-4: Estado inicial ao conectar

- QUANDO qualquer cliente se conecta via WebSocket, O SISTEMA DEVE emitir
  imediatamente `game:estado` com o status atual da sala, para que o frontend
  saiba se deve exibir tela de entrada, lobby ou aguardar.

### RF-5: Encerramento forçado da sala (`admin:encerrarSala`)

- QUANDO o professor emite `admin:encerrarSala`:
  - Cancela o timer da pergunta ativa (se houver)
  - Atualiza `GameSession.status` para `'interrompida'` no banco (se sessão existe)
  - Emite `game:salaEncerrada` para a sala `players` — o frontend redireciona
    todos os alunos para a tela de entrada com mensagem "A sala foi encerrada
    pelo professor"
  - Reseta todo o estado em memória para `inativo`
  - Emite `game:estado { status: 'inativo' }` em broadcast

### RF-6: Finalização normal (`admin:finalizarJogo`)

- QUANDO o professor emite `admin:finalizarJogo` (disponível durante
  `pergunta_ativa` ou `mostrando_resultado`):
  - Se em `pergunta_ativa`: processa o resultado da pergunta atual primeiro
  - Transiciona para `finalizado`
  - Emite ranking final (`game:fim` para jogadores, `admin:fim` para admin)

### RF-7: Avanço automático na última pergunta

- QUANDO `admin:proximaPergunta` é chamado e não há mais perguntas, o sistema
  aciona `_finalizarJogo` automaticamente (transição para `finalizado`).

### RF-8: Recuperação de sessões interrompidas no startup

- QUANDO o backend inicia (`onModuleInit` em `GameResultsService`), O SISTEMA
  DEVE encontrar todas as `GameSession` com `status = 'em_andamento'` e
  atualizar para `'interrompida'` — garantindo que reinícios não deixem
  sessões "fantasma" no banco.

### RF-9: Desconexão de jogador durante partida

- QUANDO um jogador desconecta durante `pergunta_ativa`:
  - É removido do estado em memória
  - Se todos os jogadores restantes já responderam, aciona o resultado antecipado

### RF-10: Retry automático ao reabrir sala

- QUANDO o aluno já entrou manualmente uma vez nesta sessão de navegador (dados
  salvos em `sessionStorage` como `lastJoinInfo: { turmaId, alunoId, avatar }`)
  E a sala transiciona para `lobby`, O SISTEMA DEVE automaticamente emitir
  `player:entrar` com os dados salvos, sem exigir ação do aluno.
- ENQUANTO o auto-rejoin estiver em andamento, O SISTEMA DEVE exibir uma tela
  de carregamento ("Reentrando na sala...") em vez do formulário de entrada.
- SE o auto-rejoin falhar (aluno removido da turma, erro no backend), O SISTEMA
  DEVE limpar `lastJoinInfo`, voltar ao formulário manual e exibir a mensagem
  de erro do backend.
- SE o aluno nunca entrou nesta aba/sessão (não há `lastJoinInfo`), o fluxo
  continua manual como antes.
- `lastJoinInfo` é salvo em `sessionStorage` (não `localStorage`) — sobrevive a
  refresh da página mas não persiste entre sessões de navegador, evitando
  auto-joins stale depois de dias.

## Requisitos Não-Funcionais

- O estado em memória (`GameStateService`) é singleton — uma instância por
  processo. Isso não escala horizontalmente sem sticky sessions, mas está
  dentro do escopo do MVP (sala única por servidor).
- Toda transição de estado emite `game:estado` broadcast + `admin:estado` para
  a sala `admins`, mantendo todos os clientes sincronizados.
