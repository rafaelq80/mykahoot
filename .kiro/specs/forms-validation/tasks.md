# Implementation Plan: Formulários com React Hook Form + Zod

## Overview

Substituir toda validação manual de formulário por React Hook Form + Zod. Todo formulário terá um schema Zod em `schemas/` e usará `useForm({ resolver: zodResolver(schema) })`. Mensagens de erro em português via `FormMessage` do shadcn.

## Tasks

- [ ] 1. Instalar `react-hook-form`, `zod`, `@hookform/resolvers`
- [ ] 2. Adicionar componente `Form` do shadcn (`npx shadcn add form`)
- [ ] 3. Criar `schemas/joinRoom.schema.ts` (nickname: string 1–20 chars, avatar: string não-vazio) e aplicar em `JoinRoomForm`
- [ ] 4. Criar `schemas/adminLogin.schema.ts` (password: string não-vazio) e aplicar em `AdminLoginPage`
- [ ] 5. Criar `schemas/theme.schema.ts` (name: string 1–80 chars) e aplicar em `ThemeForm`
- [ ] 6. Criar `schemas/quiz.schema.ts` (title: string 1–120 chars, themeId: uuid, description?: string) e aplicar em `QuizForm`
- [ ] 7. Criar `schemas/question.schema.ts` (text, options[4], correctIndex 0–3, timeLimitSec 5–60, imageUrl? url) e aplicar em `QuestionForm`
- [ ] 8. Alinhar limites de cada schema Zod com os DTOs NestJS correspondentes
- [ ] 9. Adicionar toasts de erro/sucesso (shadcn `Sonner`) em toda mutação HTTP dos forms de quiz/pergunta/tema
- [ ] 10. Testes: casos de erro de validação (campo vazio, tamanho excedido, formato inválido) para cada schema

## Task Dependency Graph

```
1 → 2 → 3
1 → 2 → 4
1 → 2 → 5 → 8
1 → 2 → 6 → 8
1 → 2 → 7 → 8
8 → 9 → 10
```

## Notes

- Depende de `design-system-tailwind-migration` tasks 3–4 (shadcn `form` e `sonner`).
- O schema `question.schema.ts` precisa ser coordenado com `image-upload-imagekit` (campo `imageUrl`/`imageFile`).
- Nenhuma validação manual em `onSubmit` — apenas `zodResolver`.
