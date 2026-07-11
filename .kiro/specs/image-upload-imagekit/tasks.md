# Implementation Plan: Upload de Imagem de Pergunta via ImageKit

## Overview

Implementar upload de imagens de pergunta diretamente do browser para ImageKit, usando assinatura gerada pelo backend. O campo de imagem faz parte do `QuestionForm` e usa o componente `ImageUploadField` com preview e barra de progresso.

## Tasks

- [ ] 1. Confirmar/adicionar `@UseGuards(JwtGuard)` em `ImageKitController.getAuthParams` no backend
- [ ] 2. Criar `frontend/src/services/imagekit.ts` com função `uploadQuestionImage(file, authParams)` usando fetch nativo
- [ ] 3. Criar `imageFileSchema` (tipo MIME image/*, tamanho ≤ 5 MB) para compor em `schemas/question.schema.ts`
- [ ] 4. Adicionar componente shadcn `progress` (`npx shadcn add progress`)
- [ ] 5. Criar `features/quiz-editor/components/ImageUploadField.tsx` com preview, barra de progresso e botão de remoção
- [ ] 6. Integrar `ImageUploadField` ao `QuestionForm` via `Controller` do RHF
- [ ] 7. Garantir que `VITE_IMAGEKIT_PUBLIC_KEY` e `VITE_IMAGEKIT_URL_ENDPOINT` estejam no `frontend/.env.example`
- [ ] 8. Teste manual: upload de imagem válida, rejeição de arquivo > 5 MB ou tipo inválido, remoção de imagem, edição de pergunta existente com preview da URL já salva

## Task Dependency Graph

```
1 → 2 → 5 → 6 → 8
3 → 6
4 → 5
7
```

## Notes

- Depende de `forms-validation` task 7 (`schemas/question.schema.ts`) para integração via RHF.
- Depende de `design-system-tailwind-migration` task 4 (shadcn `progress`).
- A assinatura ImageKit nunca deve ser gerada no frontend — sempre via `GET /imagekit/auth` com JWT.
- Nenhuma dependência pesada de SDK de upload: usar fetch nativo com `FormData`.
