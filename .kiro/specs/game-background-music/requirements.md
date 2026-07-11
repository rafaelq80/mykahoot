# Requirements — Música de Fundo Durante o Jogo

## Requisitos

### R1 — Toggle de música

- O SISTEMA DEVE oferecer um ícone de volume (na `TopNavBar`, conforme o manual de
  telas anexado) que liga/desliga a música de fundo, visível tanto na visão do aluno
  quanto na do professor.
- O SISTEMA DEVE lembrar a preferência do usuário (`musicEnabled`) entre sessões,
  usando `localStorage` (via `useSettingsStore` persistido).

### R2 — Faixas por fase do jogo

- QUANDO o aluno estiver no lobby, O SISTEMA DEVE tocar uma faixa ambiente calma.
- QUANDO uma pergunta estiver ativa, O SISTEMA DEVE tocar uma faixa de tensão/energia
  (loop), sincronizada ao tempo da pergunta.
- QUANDO o resultado for exibido, O SISTEMA DEVE tocar um efeito curto de
  acerto/erro (não necessariamente música contínua) e depois retomar a faixa
  ambiente.
- QUANDO o pódio final for exibido, O SISTEMA DEVE tocar uma faixa de celebração.

### R3 — Comportamento técnico

- O SISTEMA DEVE começar com a música desligada por padrão na primeira visita (a
  maioria dos navegadores bloqueia autoplay com áudio antes de interação do
  usuário) — a primeira ativação exige um clique explícito no toggle.
- QUANDO o usuário navegar entre fases do jogo, O SISTEMA DEVE trocar de faixa com
  um fade curto (evitar corte abrupto).
- O SISTEMA DEVE expor um controle de volume (slider) acessível a partir do mesmo
  ícone (popover/dropdown), não apenas liga/desliga.
- O SISTEMA NÃO DEVE bloquear nem atrasar a interação do jogo (responder pergunta,
  avançar tela) por causa de carregamento de áudio — os arquivos de áudio carregam
  de forma assíncrona/lazy.

## Fora de escopo

- Upload de música customizada pelo professor.
- Sincronização de música entre a tela do professor (projeção) e os celulares dos
  alunos (cada um controla sua própria música localmente).
