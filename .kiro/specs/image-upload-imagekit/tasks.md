# Implementation Plan: Upload de Imagem via ImageKit

## Overview

Upload de imagens (quiz e pergunta) direto do browser para o CDN ImageKit, usando
assinatura gerada pelo backend. O fluxo básico está funcional em produção; pendente
a centralização do código, validação client-side e UX de progresso.

## Tasks

### Implementado

- [x] 1. Criar `ImageKitController` com `GET /imagekit/auth` protegido por `@UseGuards(JwtAuthGuard)`, retornando `{ signature, expire, token }` via SDK `@imagekit/nodejs`
- [x] 2. Registrar `ImageKitController` no `QuizModule`
- [x] 3. Implementar função `uploadToImageKit(file, token)` no frontend usando fetch nativo + FormData (POST direto para ImageKit)
- [x] 4. Integrar upload na criação de pergunta (`AdminQuizzesPage`) — input file + envio + salva `imageUrl`
- [x] 5. Integrar upload na edição de quiz (`EditQuizPage`) — input file + envio + PATCH com nova URL
- [x] 6. Exibir preview da imagem existente na `EditQuizPage` quando `quiz.imageUrl` não é null
- [x] 7. Garantir `VITE_IMAGEKIT_PUBLIC_KEY` e `VITE_IMAGEKIT_URL_ENDPOINT` no `frontend/.env.example`
- [x] 8. Desabilitar botão de submit enquanto upload está em andamento (`uploading` state)

### Pendente

- [x] 9. Extrair `uploadToImageKit` para `frontend/src/services/imagekit.ts` — eliminar duplicação entre AdminQuizzesPage e EditQuizPage
- [x] 10. Adicionar validação client-side antes do upload: tipo MIME (jpeg/png/webp) e tamanho (≤ 5 MB), com mensagem de erro inline
- [x] 11. Implementar barra de progresso visual durante upload (usando `XMLHttpRequest.upload.onprogress`)
- [ ] 12. Criar componente reutilizável `ImageUploadField` com: input file, preview, barra de progresso, botão de remover
- [ ] 13. Adicionar botão "Remover imagem" que faz PATCH com `imageUrl: null` (tanto para quiz quanto para pergunta)
- [ ] 14. Testes: upload de arquivo válido, rejeição de arquivo grande/tipo inválido, remoção de imagem, edição com preview

## Task Dependency Graph

```
1 → 2 → 3 → 4, 5
5 → 6
3, 4 → 8
9 → 10 → 12
11 → 12
12 → 13 → 14
```

## Notes

- Tasks 1–8 estão em produção e funcionando.
- Tasks 9–14 são dívida técnica — melhorias de DX e UX, não bloqueiam funcionalidade.
- A função `uploadToImageKit` é idêntica nos dois arquivos — a task 9 é a primeira a atacar.
- Quando RHF + Zod forem adotados (spec `forms-validation`), o `ImageUploadField` (task 12) deve ser integrável via `Controller`.
