# Requirements — Migração de Estilo para Tailwind CSS + shadcn/ui

## Contexto

A v1 usa CSS puro/CSS Modules (`AdminForms.module.css`, `AdminPage.module.css`,
`PlayerPage.module.css`, `variables.css`) num tema escuro "arcade neon" que **não é**
o solicitado agora. O usuário anexou um novo manual de telas e diretrizes de design
("Vibrant Pulse") pedindo Tailwind, visual mais moderno/dinâmico e uso de shadcn onde
apropriado.

## Requisitos

### R1 — Setup Tailwind

- O SISTEMA DEVE ter Tailwind CSS configurado no projeto Vite (`tailwind.config.ts`,
  `postcss.config.js`, `styles/globals.css` com as camadas `@tailwind base/
  components/utilities`).
- O SISTEMA DEVE mapear a paleta, tipografia e raio de borda do design system
  "Vibrant Pulse" (ver steering `design-system.md`) em `tailwind.config.ts`, não em
  CSS solto.

### R2 — Remoção de CSS Modules

- O SISTEMA DEVE remover `AdminForms.module.css`, `AdminPage.module.css`,
  `PlayerPage.module.css` e `variables.css` **somente após** cada tela equivalente
  estar re-implementada com classes Tailwind (migração incremental tela a tela, não
  big-bang).
- QUANDO uma tela for migrada, O SISTEMA DEVE remover o `import styles from
  './X.module.css'` correspondente na mesma tarefa.

### R3 — shadcn/ui onde apropriado

- O SISTEMA DEVE usar componentes shadcn para: `Button`, `Input`, `Select`, `Dialog`
  (confirmação de ações destrutivas como excluir quiz), `Table` (relatórios e placar
  completo), `Tabs` (dashboard do professor), `Toast`/`Sonner` (feedback de
  sucesso/erro em mutações).
- O SISTEMA NÃO DEVE usar shadcn para os elementos de jogo com identidade visual
  própria e forte (grid de alternativas, timer, pódio) — esses são componentes
  customizados em `components/shared`, só usando os tokens Tailwind.

### R4 — Consistência visual com o manual anexado

- QUANDO qualquer tela do fluxo do aluno ou do professor for implementada, O SISTEMA
  DEVE seguir o layout descrito em `manual_de_telas_quizmaster_live.md` (fornecido
  pelo usuário) para aquela tela específica.
- O SISTEMA DEVE aplicar as 4 cores de alternativa (`option.a/b/c/d`) de forma
  consistente entre a tela do aluno e a tela de projeção do professor — mesma cor,
  mesma forma geométrica, em ambas as visões, para uma mesma posição de alternativa.

### R5 — Responsividade

- O SISTEMA DEVE renderizar o fluxo do aluno mobile-first (base 360px) e o dashboard
  do professor desktop-first, com breakpoints Tailwind padrão (`sm`, `md`, `lg`).

## Fora de escopo

- Dark mode / troca de tema em runtime (não solicitado).
- Redesenho de fluxo de navegação (isso é coberto por
  `frontend-component-architecture`).
