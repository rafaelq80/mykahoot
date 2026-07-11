# Implementation Plan: Migração de Estilo para Tailwind CSS + shadcn/ui

## Overview

Migrar toda a estilização do frontend de CSS Modules para Tailwind CSS v4 + shadcn/ui, aplicando o design system "Vibrant Pulse" (brand #46178f, option a/b/c/d, superfície clara) definido em `steering/design-system.md`. Após a migração, nenhum arquivo `.module.css` ou token hardcoded deve restar em `frontend/src`.

## Tasks

- [x] 1. Instalar Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`), `clsx`, `tailwind-merge` e configurar plugin no `vite.config.ts`
- [x] 2. Criar `styles/globals.css` com `@tailwind` layers, tokens `@theme` (brand/option/surface/fonte Montserrat/raio) e keyframes (`slideUp`, `shake`); importar em `main.tsx`
- [ ] 3. Rodar `npx shadcn init` e configurar `components.json` com cor primária `brand`
- [ ] 4. Adicionar componentes shadcn: `button`, `input`, `select`, `textarea`, `dialog`, `table`, `tabs`, `sonner`
- [x] 5. Implementar `components/shared`: `AvatarBadge`, `ScorePill`, `OptionButton`, `TimerDisplay`, `ProgressBar`, `RankingRow` com tokens Tailwind e estados descritos no design.md
- [x] 6. Reimplementar telas do fluxo do aluno em Tailwind (`features/player-session`, `question-flow`, `ranking`, `pages/player/*`), remover dependência de `PlayerPage.module.css`
- [ ] 7. Deletar `styles/PlayerPage.module.css` (após validar fluxo do aluno)
- [ ] 8. Reimplementar dashboard do professor (`features/admin-control`, `pages/admin/AdminDashboardPage`) em Tailwind + shadcn `Table`/`Tabs`, remover import de `AdminPage.module.css`
- [ ] 9. Deletar `styles/AdminPage.module.css`
- [ ] 10. Reimplementar `QuizForm`/`QuestionForm`/`ThemeForm`/`AdminLoginPage` com shadcn `Input`/`Select`/`Textarea`/`Dialog`, remover import de `AdminForms.module.css`
- [ ] 11. Deletar `styles/AdminForms.module.css` e `styles/variables.css`
- [ ] 12. Busca final por hex literal em `frontend/src` fora do `globals.css` — deve retornar vazio
- [ ] 13. Checklist visual manual comparando cada tela contra o design system

## Task Dependency Graph

```
1 → 2 → 3 → 4
2 → 5 → 6 → 7
4 → 8 → 9
4 → 10 → 11
6, 8, 10 → 12 → 13
```

## Notes

- Tailwind v4 usa `@theme` em vez de `tailwind.config.ts` — não criar config separado.
- shadcn ainda não está instalado; tasks 3–4 são pré-requisito para o CRUD admin (tasks 8–11).
- CSS Modules antigos (`PlayerPage.module.css`, `AdminPage.module.css`, `AdminForms.module.css`, `variables.css`) devem ser deletados apenas após validar que nenhum componente os importa mais.
