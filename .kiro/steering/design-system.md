---
title: Design System — Vibrant Pulse
inclusion: fileMatch
fileMatchPattern: 'frontend/src/**/*.{tsx,ts,css}'
---

# Design System: Vibrant Pulse

Fonte: `manual_de_telas_quizmaster_live.md` + `instru_es_de_design_quizmaster_live.md`
(anexados pelo usuário). Este arquivo é a **tradução desses documentos para tokens
Tailwind** — qualquer componente novo deve consumir os tokens abaixo, nunca cores/
espaçamentos hardcoded.

> Isto substitui o steering antigo `frontend-design.md` (tema "arcade neon escuro"),
> que não está mais em uso. Se o Kiro encontrar referências a `--color-neon-*` ou
> `Boogaloo` em código existente, é dívida técnica da v1 a ser migrada, não o padrão
> atual.

## Paleta (`tailwind.config.ts` → `theme.extend.colors`)

```ts
colors: {
  brand: {
    DEFAULT: '#46178f',   // Roxo Vibrante — marca, ações primárias, superfícies de destaque
    foreground: '#ffffff',
  },
  option: {
    a: '#e21b3c',  // Triângulo — vermelho vibrante
    b: '#1368ce',  // Losango/Pentágono — azul puro
    c: '#d89e00',  // Círculo — amarelo ouro
    d: '#26890c',  // Quadrado (frequentemente a correta no exemplo) — verde vibrante
  },
  surface: {
    DEFAULT: '#fef7ff',      // fundo principal claro
    container: '#f8f1fc',    // cards e áreas de agrupamento
  },
}
```

Regras de uso das cores de opção: **nunca** fixar a cor D como "a correta" no código —
a posição da resposta certa vem do backend (`correctIndex`) e é aplicada
dinamicamente. As 4 cores são só o mapeamento visual triângulo/losango/círculo/
quadrado.

## Tipografia

- Fonte principal: **Montserrat** (Google Fonts), carregada em `styles/globals.css`.
- Escala semântica Tailwind (mapear em `fontSize` do config, não usar `text-[Npx]`
  ad-hoc):
  - `headline-md` → títulos de tela
  - `body-lg` / `body-md` → conteúdo e tabelas
- Pesos: `font-black` para wordmark/logo, `font-bold` para botões e destaques,
  `font-medium` para textos informativos.

```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&display=swap');
```

## Forma e elevação

- Border radius padrão (`ROUND_EIGHT`): `rounded-lg` a `rounded-xl` (8–12px) em cards
  e botões — mapear como `borderRadius.DEFAULT` no config para não repetir a decisão
  em cada componente.
- Elevação: `shadow-md` em cards sobre o fundo claro `surface`. Evitar sombras mais
  pesadas que isso — o estilo é "vibrante e limpo", não "arcade".

## Componentes principais e onde vivem (mapear para shadcn + `components/shared`)

| Componente do manual                     | Implementação                                                    |
|-------------------------------------------|--------------------------------------------------------------------|
| TopNavBar                                 | `components/shared/TopNavBar.tsx` — fundo `surface`, logo à esquerda, PIN centralizado, ícones de volume (liga com `background-music`) e config à direita |
| SideNavBar (professor)                     | `components/shared/AdminSideNav.tsx` — itens Dashboard/Questions/Players/Leaderboard, fundo lavanda claro, ativo com fundo `brand`/10 e texto `brand`, CTA "End Game" em vermelho fixo na base |
| Cards de resposta                          | `components/shared/OptionButton.tsx` — grid 2×2 mobile-first, ícone geométrico à esquerda (▲ ◆ ● ■), texto centralizado, estado `selected`/`correct`/`wrong`/`disabled` |

## Padrões de tela (resumo operacional — telas completas descritas no manual anexado)

- **Aluno – Inserir PIN:** fundo `brand` com padrão de pontos sutil, card branco
  central `surface`, input numérico grande, botão "ENTER" com `active:scale-95`.
- **Aluno – Nome e Avatar:** grid de avatares circulares, input de nickname, CTA
  "Ready to Play!" fixo na base, desabilitado até nickname + avatar preenchidos —
  este CTA só habilita de fato quando a sala está aberta (ver spec
  `room-lifecycle-single-room`); se fechada, mostrar estado de espera em vez do form.
- **Aluno – Responder Pergunta:** grid 2×2 sem texto nos botões (só forma+cor),
  cronômetro em barra no topo, `OptionButton` some/disable ao responder.
- **Aluno – Resultado:** verde + check para acerto, vermelho + listras para erro;
  mostra posição atual e pontos para subir no ranking.
- **Aluno – Pódio/Ranking:** visualização 3D dos 3 primeiros, lista rolável completa
  com accuracy e streak.
- **Professor – Dashboard:** cards de quiz com "Class Average" e "Toughest Topic",
  SideNavBar com Reports/Groups/Marketplace.
- **Professor – Criação de Pergunta:** textarea de pergunta, upload de imagem central
  (via ImageKit — spec própria), respostas coloridas na base, sidebar com Time
  Limit/Points/tipo.
- **Professor – Pergunta Projetada:** pergunta+imagem central, alternativas com forma
  e cor mas **sem indicar a correta**; contagem de respostas por alternativa
  **oculta** até o fim do tempo.
- **Professor – Resultado da Pergunta:** gráfico de barras com distribuição por
  alternativa, correta destacada em verde `option.d`/verde semântico, KPIs de média
  de resposta e streaks da sala.
- **Professor – Ranking Parcial:** top 5 com indicador de subida de posição e streak,
  fundo claro para legibilidade.
- **Professor – Relatórios:** KPIs de engajamento, taxa de acerto por pergunta, lista
  de alunos com status de finalização.

## Interatividade e responsividade

- Transições suaves em hover; `active:scale-95` em botões clicáveis (Tailwind
  `transition-transform`).
- Mobile-first para o fluxo do aluno (base 360px, alternativas em coluna única antes
  de `sm:`, grid 2×2 a partir de `sm:`).
- Desktop-first para o painel do professor; sidebar fixa a partir de `lg:`.
- Respeitar `prefers-reduced-motion`: usar `motion-reduce:transition-none` do Tailwind
  em qualquer animação não essencial.
- Acessibilidade mínima: contraste ≥ 4.5:1 no texto sobre `option.a/b/c/d`, foco
  visível (`focus-visible:ring-2 focus-visible:ring-brand`) em todo elemento
  interativo.

## shadcn/ui

Usar shadcn onde o componente é genérico (Button, Dialog, Input, Select, Tabs,
Toast/Sonner para feedback de ações do professor, Table para relatórios). Estilizar
via `tailwind.config.ts` (tema `brand`/`option`/`surface` acima) — não criar uma
segunda paleta dentro dos componentes shadcn.
