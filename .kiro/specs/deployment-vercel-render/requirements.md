# Requirements — Deploy (Frontend Vercel / Backend Render)

## Requisitos

### R1 — Frontend no Vercel

- O SISTEMA DEVE ser configurado como um projeto Vite estático no Vercel, com build
  command `npm run build` e output `dist/`.
- O SISTEMA DEVE ler `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_IMAGEKIT_PUBLIC_KEY`,
  `VITE_IMAGEKIT_URL_ENDPOINT` das variáveis de ambiente do projeto Vercel (nunca
  commitadas).

### R2 — Backend no Render

- O SISTEMA DEVE ser configurado como Web Service no Render, build command `npm run
  build`, start command `npm run start:prod`.
- O SISTEMA DEVE ler todas as variáveis de `backend/.env` (ver `tech.md`) das
  variáveis de ambiente do serviço Render.
- O SISTEMA DEVE expor um endpoint de health check (`GET /health`) para o Render
  monitorar o serviço.

### R3 — CORS e WebSocket entre domínios distintos

- QUANDO o frontend (Vercel) e o backend (Render) estiverem em domínios diferentes,
  O SISTEMA DEVE configurar CORS no NestJS (`CORS_ORIGIN` = URL exata do Vercel) e o
  Socket.io Gateway com a mesma origem permitida.
- O SISTEMA DEVE usar `wss://` (TLS) para a conexão de socket em produção — o Render
  já serve com TLS por padrão.

### R4 — Migração de banco em deploy

- QUANDO uma nova versão do backend for publicada com mudança de schema, O SISTEMA
  DEVE rodar `npx prisma migrate deploy` (não `migrate dev`) como parte do processo
  de build/release no Render.

### R5 — Cold start (plano gratuito do Render)

- SE o backend estiver hospedado no plano gratuito do Render, ENTÃO O SISTEMA DEVE
  documentar o comportamento de cold start (o serviço dorme após inatividade e leva
  ~30–60s para responder à primeira requisição) e, opcionalmente, prever um serviço
  externo de "ping" periódico para mitigar — decisão do usuário, registrada aqui como
  trade-off, não como requisito obrigatório.

## Fora de escopo

- CI/CD com testes automatizados bloqueando deploy (pode ser adicionado depois via
  GitHub Actions, não faz parte desta spec).
