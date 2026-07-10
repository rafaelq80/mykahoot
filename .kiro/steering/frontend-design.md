# Frontend Design: QuizLive

## Identidade Visual

Inspirado na energia do Kahoot — telas grandes, cores saturadas, respostas em blocos coloridos — mas com uma identidade mais **escura, neon e arcade**, como se o quiz acontecesse dentro de um fliperama dos anos 90. O ambiente deve parecer uma arena de competição, não uma sala de aula digital. Aposta visual única: **tipografia display ultra-wide com brilho neon animado**, como letreiros luminosos de uma máquina de pinball.

---

## Tokens de Design

### Paleta

```
--color-bg:          #0D0D1A   /* quase preto azulado — fundo base */
--color-surface:     #16162A   /* superfície de cards e painéis */
--color-surface-alt: #1E1E38   /* hover/destaque suave em superfícies */
--color-neon-green:  #39FF14   /* acerto, confirmação, vida */
--color-neon-pink:   #FF2D78   /* erro, eliminação, energia */
--color-neon-blue:   #00CFFF   /* pergunta ativa, progresso, timer */
--color-neon-yellow: #FFE600   /* pontuação, troféu, destaque */
--color-text-primary: #FFFFFF
--color-text-muted:   #8888AA
--color-border:       #2A2A4A
```

#### Cores das 4 alternativas (mesmo padrão do Kahoot, mas mais saturado)

```
--color-opt-A: #E63A5C   /* vermelho-pink   — triângulo */
--color-opt-B: #3A8BFF   /* azul elétrico   — diamante  */
--color-opt-C: #FFB800   /* âmbar           — círculo   */
--color-opt-D: #1EC97E   /* verde esmeralda — quadrado  */
```

### Tipografia

- **Display** — `Boogaloo` (Google Fonts): letras largas, arredondadas, personalidade de jogo. Usada em títulos de pergunta, contadores de score e ranking. Peso 400 (a face já tem força suficiente).
- **Interface** — `DM Sans` (Google Fonts): limpa e neutra, excelente legibilidade em telas escuras. Pesos 400 e 600. Usada em labels, botões, nicknames e textos secundários.
- **Mono / dados** — `DM Mono` (Google Fonts): pontuação ao vivo, tempo restante, posições do ranking.

```css
/* Escala tipográfica */
--text-xs:   0.75rem   /* 12px — labels de status, badges */
--text-sm:   0.875rem  /* 14px — texto secundário, muted  */
--text-base: 1rem       /* 16px — corpo padrão            */
--text-lg:   1.25rem   /* 20px — subtítulos              */
--text-xl:   1.5rem    /* 24px — títulos de seção        */
--text-2xl:  2rem       /* 32px — pergunta principal      */
--text-3xl:  2.75rem   /* 44px — score / countdown       */
--text-hero: 4rem       /* 64px — letreiro, tela inicial  */
```

### Espaçamento

Múltiplos de 4px. Escala: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.

### Raios e Sombras

```css
--radius-sm:  8px
--radius-md:  16px
--radius-lg:  24px
--radius-full: 9999px  /* pílulas: badges, avatares */

/* Sombra neon — aplicar com a cor correta em cada contexto */
--glow-green:  0 0 12px #39FF1480, 0 0 32px #39FF1430
--glow-pink:   0 0 12px #FF2D7880, 0 0 32px #FF2D7830
--glow-blue:   0 0 12px #00CFFF80, 0 0 32px #00CFFF30
--glow-yellow: 0 0 12px #FFE60080, 0 0 32px #FFE60030
```

---

## Elemento Assinatura

**Glow pulsante no timer.** O contador regressivo é exibido em `Boogaloo` enorme, cor `--color-neon-blue`, com `--glow-blue` animado via `@keyframes pulse-glow` que oscila a opacidade do blur entre 60% e 100%. Quando restam ≤ 5 segundos, a cor troca para `--color-neon-pink` e o glow vira `--glow-pink`, acelerando a pulsação. Esse único efeito âncora a identidade arcade em toda a experiência do jogador.

---

## Animações

```css
/* Pulsação de glow — usada no timer e no letreiro da tela inicial */
@keyframes pulse-glow {
  0%, 100% { filter: brightness(1)   drop-shadow(0 0 8px currentColor); }
  50%       { filter: brightness(1.3) drop-shadow(0 0 20px currentColor); }
}

/* Entrada de cards — alternativas e cards de jogador */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Resultado correto — flash verde no fundo */
@keyframes flash-correct {
  0%   { background-color: #39FF1420; }
  50%  { background-color: #39FF1440; }
  100% { background-color: transparent; }
}

/* Resultado errado — shake sutil */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-6px); }
  75%       { transform: translateX(6px); }
}
```

Respeitar `prefers-reduced-motion`: remover `pulse-glow` e `shake`, manter apenas `slide-up` com duração reduzida.

---

## Telas e Layout

### Tela do Jogador

#### 1. Entrada na Sala (`/`)

```
┌──────────────────────────────────────┐
│                                      │
│   [logo QuizLive — glow animado]     │
│                                      │
│   ┌──────────────────────────────┐   │
│   │  Escolha seu avatar          │   │
│   │  [😺][🦊][🐼][🤖][👾][🦄]   │   │
│   │  [🐸][🎃][👻][🦁][🐯][🐧]   │   │
│   └──────────────────────────────┘   │
│                                      │
│   ┌──────────────────────────────┐   │
│   │  Seu apelido                 │   │
│   │  [____________________]      │   │
│   └──────────────────────────────┘   │
│                                      │
│   [ ENTRAR NA ARENA  →  ]            │
│                                      │
└──────────────────────────────────────┘
```

- Fundo: `--color-bg` com partículas estáticas (pontos brancos 1px, CSS puro, sem lib)
- Logo: `Boogaloo`, `--text-hero`, cor `--color-neon-yellow`, `pulse-glow` lento (3s)
- Avatares: emojis em botão circular 56×56px, borda `--color-border` 2px, selecionado → borda `--color-neon-yellow` + `--glow-yellow`
- Input: fundo `--color-surface`, borda `--color-border`, focus → borda `--color-neon-blue`
- Botão Entrar: fundo `--color-neon-yellow`, texto preto `DM Sans` 600, `--radius-md`, `--glow-yellow` no hover, disabled se sem nickname/avatar

#### 2. Sala de Espera (Lobby)

```
┌──────────────────────────────────────┐
│  😺 Astro_Cat           [posição 1º] │  ← header fixo: avatar + nickname
│                                      │
│   Aguardando o professor...          │
│   ▸ [avatar] Astro_Cat               │
│   ▸ [avatar] NeonFox                 │
│   ▸ [avatar] PixelPanda              │
│   ▸ [avatar] ...                     │
│                                      │
│   [ 4 jogadores na arena ]           │
└──────────────────────────────────────┘
```

- Lista de jogadores com `slide-up` a cada novo que entra
- Contagem de jogadores em `DM Mono`, cor `--color-neon-blue`

#### 3. Pergunta Ativa

```
┌──────────────────────────────────────┐
│  😺 Astro_Cat          Score: 1.500  │  ← header (score em DM Mono neon-yellow)
├──────────────────────────────────────┤
│                                      │
│   [barra de progresso: 4 de 10]      │
│                                      │
│   [imagem da pergunta — 16:9]        │
│                                      │
│   Qual é a capital do Japão?         │
│               ┌──┐                   │
│               │12│  ← timer neon     │
│               └──┘                   │
│                                      │
├──────────┬───────────────────────────┤
│ ▲ Tóquio │ ◆ Pequim                 │
├──────────┼───────────────────────────┤
│ ● Seul   │ ■ Osaka                  │
└──────────┴───────────────────────────┘
```

- Grid 2×2 para as alternativas, cada uma ocupa 50% da largura (mobile: 100%)
- Cor de fundo de cada alternativa: `--color-opt-A/B/C/D` com 90% opacidade
- Ícone de forma geométrica (▲ ◆ ● ■) antes do texto — mesmo padrão Kahoot
- Ao responder: alternativas não selecionadas ficam `opacity: 0.35`; a selecionada mantém brilho e exibe `✓` ou aguarda o resultado
- Barra de progresso da pergunta (ex.: "4 de 10"): linear-gradient de `--color-neon-blue`
- Timer: `Boogaloo` `--text-3xl`, centralizado acima do grid, `pulse-glow` + troca para neon-pink nos últimos 5s

#### 4. Resultado da Pergunta

```
┌──────────────────────────────────────┐
│  😺 Astro_Cat          Score: 2.350  │
│                                      │
│   ✓ CORRETO!    + 850 pts            │  ← flash verde, Boogaloo grande
│   ou                                 │
│   ✗ Errou!      + 0 pts              │  ← shake + flash rosa
│                                      │
│   Resposta certa: ▲ Tóquio           │
│                                      │
│   ── Top 5 ──────────────────────    │
│   🥇 NeonFox        2.800 pts        │
│   🥈 Astro_Cat      2.350 pts  ← você│
│   🥉 PixelPanda     2.100 pts        │
│   4  GlowBot        1.950 pts        │
│   5  BinaryKid      1.700 pts        │
│                                      │
│   Aguardando o professor...          │
└──────────────────────────────────────┘
```

- Flash de fundo via `flash-correct` (verde) ou animação `shake` no card de resultado (pink)
- `+850 pts` em `Boogaloo` `--text-2xl` `--color-neon-yellow`
- Top 5: medalhas 🥇🥈🥉 para os 3 primeiros, números simples para 4º e 5º
- Linha do próprio jogador destacada: fundo `--color-surface-alt`, borda-left 3px `--color-neon-blue`

#### 5. Ranking Final (`game:fim`)

```
┌──────────────────────────────────────┐
│                                      │
│        🏆  FIM DA ARENA  🏆          │
│                                      │
│   🥇 NeonFox        3.650 pts        │
│   🥈 Astro_Cat      3.100 pts  ← você│
│   🥉 PixelPanda     2.900 pts        │
│      GlowBot        2.400 pts        │
│      BinaryKid      2.050 pts        │
│                                      │
│   Sua posição final: 2º de 28        │
│                                      │
└──────────────────────────────────────┘
```

- Tela full-screen, fundo `--color-bg`
- Confetti CSS puro (divs coloridos com `@keyframes fall`) por 3s no carregamento
- Top 3 com cards maiores, com glow correspondente (gold, silver, bronze)
- Posição do jogador fora do top 5: card menor exibido abaixo da lista, com borda `--color-neon-blue`

---

### Dashboard do Professor

Separado visualmente do modo jogador — mesma paleta e tipografia, mas layout mais informacional e menos "arcade". A identidade do jogo está presente mas o professor lê dados, não joga.

#### 1. Login

```
┌──────────────────────────────────────┐
│                                      │
│        QuizLive  —  Professor        │
│                                      │
│   [ Senha de acesso ]                │
│   [_______________________]          │
│                                      │
│   [ ENTRAR ]                         │
│                                      │
└──────────────────────────────────────┘
```

#### 2. Tela Principal (Controle da Partida)

```
┌──────────────────────────────────────────────────────────────┐
│  QuizLive          [Quiz: História do Brasil — Tema: ENEM]   │
│                    [  ← Trocar quiz  ]                       │
├──────────────────────────────────────────────────────────────┤
│  SALA ABERTA — 28 jogadores                                  │
│  [lista scrollável: avatar + nickname de cada jogador]       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Pergunta 4 de 10                                            │
│  "Qual foi o ano da Proclamação da República?"               │
│                                                              │
│  [ LIBERAR PERGUNTA ]   ou   [ PRÓXIMA PERGUNTA ]            │
│                                                              │
│  Timer: 18s restantes                                        │
│  Responderam: 21 / 28                                        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  PLACAR COMPLETO                                             │
│  1  NeonFox        2.800 pts                                 │
│  2  Astro_Cat      2.350 pts                                 │
│  ...                                                         │
└──────────────────────────────────────────────────────────────┘
```

- Sidebar lateral em desktop (≥1024px); stacked em mobile
- Botão de controle principal: único e grande, texto muda conforme o `status`
  - `lobby` → **"LIBERAR PRIMEIRA PERGUNTA"**
  - `pergunta_ativa` → desabilitado (aguardando resultado automático)
  - `mostrando_resultado` → **"PRÓXIMA PERGUNTA"** / **"ENCERRAR JOGO"** (na última)
- Contador "Responderam X/Y" em `DM Mono` atualiza em tempo real
- Placar completo em tabela simples, sem limite de linhas

#### 3. Histórico de Partidas (`/admin/historico`)

```
┌──────────────────────────────────────┐
│  Histórico de partidas               │
│                                      │
│  ● 15/06/2025  História - ENEM  ✓    │  ← finalizado
│  ● 14/06/2025  Geografia        ✗    │  ← interrompida
│  ● 10/06/2025  Matemática       ✓    │
│                                      │
│  [clicar → abre detalhes completos]  │
└──────────────────────────────────────┘
```

- Status `finalizado` → badge verde `✓ COMPLETA`
- Status `interrompida` → badge amarelo `⚠ INTERROMPIDA` com tooltip explicando que os dados parciais foram salvos

---

## Componentes Reutilizáveis

### `<AvatarBadge>` — emoji + nickname
```
[🦊] NeonFox
```
- Avatar em círculo 40px, fundo `--color-surface-alt`
- Nickname em `DM Sans` 600

### `<ScorePill>` — pontuação estilizada
```
  2.350 pts
```
- `DM Mono`, `--color-neon-yellow`, `--text-lg`

### `<OptionButton>` — alternativa A/B/C/D
- Full-width no mobile, 50% no desktop
- Cor de fundo: `--color-opt-A/B/C/D`
- Borda-radius: `--radius-md`
- Estado `disabled` (após responder): `opacity: 0.35`, `cursor: not-allowed`
- Estado `selected` (antes do resultado): borda branca 3px
- Estado `correct` (após resultado): borda `--color-neon-green` + `--glow-green`
- Estado `wrong` (após resultado): borda `--color-neon-pink` + animação `shake`

### `<TimerDisplay>` — countdown
- `Boogaloo`, `--text-3xl`
- `> 5s`: `--color-neon-blue` + `pulse-glow` lento (2s)
- `≤ 5s`: `--color-neon-pink` + `pulse-glow` rápido (0.6s)

### `<ProgressBar>` — progresso do quiz
- Barra fina (4px) no topo da tela do jogador
- `width: (currentIndex / totalQuestions) * 100%`
- Cor: linear-gradient de `--color-neon-blue` para `--color-neon-green`
- Transição: `width 0.4s ease`

### `<RankingRow>` — linha do placar
- Posição (DM Mono muted), medalha emoji (top 3), avatar, nickname, score
- Jogador atual: fundo `--color-surface-alt`, borda-left 3px `--color-neon-blue`

---

## Responsividade

- **Mobile-first** (360px base): alternativas em coluna única (2 rows × 1 col), timer e pergunta acima, header compacto
- **≥ 640px**: alternativas em 2 colunas (grid 2×2)
- **≥ 1024px (dashboard)**: sidebar fixa esquerda (jogadores/placar) + área central (controles + pergunta)

---

## Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Boogaloo&family=DM+Sans:wght@400;600&family=DM+Mono:wght@400&display=swap');
```
