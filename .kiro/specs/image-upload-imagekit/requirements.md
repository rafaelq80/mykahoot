# Requirements — Upload de Imagem via ImageKit

## Contexto

O upload de imagens (para quizzes e perguntas) já funciona em produção via ImageKit.
O backend gera parâmetros de assinatura (`GET /imagekit/auth`, protegido por JWT) e
o frontend faz o upload direto para o CDN do ImageKit sem que o binário passe pelo
servidor. Esta spec documenta o fluxo real e identifica melhorias pendentes.

## Requisitos Funcionais (implementados)

### RF-1: Endpoint de autenticação assinada (Backend)

- O backend expõe `GET /imagekit/auth` retornando `{ signature, expire, token }`.
- O endpoint é protegido por `@UseGuards(JwtAuthGuard)` — apenas o professor
  autenticado pode gerar credenciais de upload.
- Se as variáveis de ambiente do ImageKit não estiverem configuradas, o endpoint
  retorna 503 com mensagem clara.

### RF-2: Upload client-side direto para ImageKit

- O frontend obtém os parâmetros de assinatura via `GET /imagekit/auth` (com JWT).
- Monta um `FormData` com: `file`, `fileName`, `publicKey` (de
  `VITE_IMAGEKIT_PUBLIC_KEY`), `signature`, `expire`, `token`.
- Faz POST direto para `{VITE_IMAGEKIT_URL_ENDPOINT}/api/v1/files/upload`.
- Recebe a URL final da imagem hospedada no CDN do ImageKit.

### RF-3: Imagem associada a Quiz e Question

- `Quiz.imageUrl` (nullable): imagem de capa do quiz, editável na `EditQuizPage`.
- `Question.imageUrl` (nullable): imagem da pergunta, definida na criação/edição.
- Ambas armazenam a URL do ImageKit retornada após upload bem-sucedido.

### RF-4: Preview de imagem existente

- Na `EditQuizPage`, se o quiz já possui `imageUrl`, um thumbnail é exibido antes
  de qualquer novo upload.

### RF-5: Segurança

- `IMAGEKIT_PRIVATE_KEY` existe apenas em `backend/.env`, nunca exposta no frontend.
- O frontend usa apenas `VITE_IMAGEKIT_PUBLIC_KEY` e `VITE_IMAGEKIT_URL_ENDPOINT`.

## Requisitos pendentes (não implementados)

### RF-6: Validação de arquivo antes do upload

- O sistema DEVE aceitar apenas `image/jpeg`, `image/png`, `image/webp`.
- O sistema DEVE rejeitar arquivos > 5 MB com mensagem clara antes de iniciar o upload.

### RF-7: Feedback de progresso

- Durante o upload, uma barra de progresso deve ser exibida e o botão de submit
  desabilitado.

### RF-8: Componente reutilizável

- A lógica de upload deve ser extraída para um componente/serviço centralizado,
  eliminando a duplicação atual entre `AdminQuizzesPage` e `EditQuizPage`.

### RF-9: Remoção de imagem

- O sistema deve permitir remover a imagem associada (campo `imageUrl` volta a null)
  sem exigir upload de uma nova.

## Fora de escopo

- Edição de imagem (crop/resize) no cliente.
- Galeria de imagens reaproveitáveis entre perguntas.
