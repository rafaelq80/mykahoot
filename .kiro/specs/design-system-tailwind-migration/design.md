# Design — Migração de Estilo para Tailwind CSS + shadcn/ui

## Configuração

`tailwind.config.ts` (trecho relevante — valores completos em `design-system.md`):

```ts
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#46178f', foreground: '#ffffff' },
        option: { a: '#e21b3c', b: '#1368ce', c: '#d89e00', d: '#26890c' },
        surface: { DEFAULT: '#fef7ff', container: '#f8f1fc' },
      },
      fontFamily: { sans: ['Montserrat', 'sans-serif'] },
      borderRadius: { DEFAULT: '10px' },
    },
  },
  plugins: [require('tailwindcss-animate')], // usado pelo shadcn
} satisfies Config
```

`components.json` do shadcn aponta `baseColor: "neutral"` com override de `--primary`
para o roxo `brand` (gerado via CLI `npx shadcn init`, depois `npx shadcn add button
input select dialog table tabs sonner`).

## Estratégia de migração incremental

Migração **tela a tela**, na mesma ordem da decomposição de componentes (spec
`frontend-component-architecture`), para as duas specs andarem juntas sem duplicar
esforço:

1. `styles/globals.css` + `tailwind.config.ts` (base, sem tocar em tela nenhuma ainda)
2. Fluxo do aluno (`JoinRoomPage` → `PodiumPage`) — remove `PlayerPage.module.css`
3. Dashboard do professor — remove `AdminPage.module.css`
4. Formulários de quiz/pergunta/tema — remove `AdminForms.module.css`, introduz
   shadcn `Input`/`Select`/`Dialog`
5. Remoção final de `variables.css` quando nenhum componente mais o importar

## Componentes shadcn a instalar e onde usar

| Componente shadcn | Uso |
|---|---|
| `Button` | Todo CTA que não seja `OptionButton` (que é custom, com forma+cor de alternativa) |
| `Input`, `Select`, `Textarea` | Campos de `QuizForm`, `QuestionForm`, `ThemeForm`, `AdminLoginPage` |
| `Dialog` | Confirmação de exclusão de quiz/pergunta/tema, confirmação de "Fechar Sala" (derruba jogadores) |
| `Table` | `FullScoreboardTable`, relatórios em `AdminHistoricoPage` |
| `Tabs` | Navegação dentro do dashboard do professor, se houver sub-seções |
| `Sonner` (toast) | Feedback de sucesso/erro de mutações (criar/editar/excluir) |

## Componentes customizados (não-shadcn) e seus estados visuais

- `OptionButton`: props `shape: 'triangle'|'diamond'|'circle'|'square'`, `color:
  'a'|'b'|'c'|'d'`, `state: 'idle'|'selected'|'correct'|'wrong'|'disabled'`. Estilo
  via `cn()` compondo classes Tailwind condicionalmente por `state`.
- `TimerDisplay`: prop `secondsLeft`; classe muda de `text-brand` para
  `text-option-a` (alerta) quando `secondsLeft <= 5`, com `animate-pulse` respeitando
  `motion-reduce:animate-none`.
- `ProgressBar`: `style={{ width: `${(current/total)*100}%` }}` com transição
  `transition-[width] duration-300`.

## Critérios de aceite

- Nenhum arquivo `.module.css` remanescente ao final da spec.
- `tailwind.config.ts` é a única fonte de cor/tipografia/raio — busca por hex literal
  fora do config retorna zero resultados em `frontend/src`.
- Telas conferidas visualmente contra o manual anexado (checklist manual, tarefa
  final).
