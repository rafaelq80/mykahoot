# Implementation Plan: Deploy (Frontend Vercel / Backend Render)

## Overview

Configurar e documentar o deploy do frontend no Vercel (Static/SPA) e do backend no Render (Web Service Node.js). Inclui CORS restrito à origem de produção, health check, schema Prisma com `directUrl` para migrations e documentação do cold start do plano free.

## Tasks

- [ ] 1. Adicionar `GET /health` em `AppController` retornando `{ status: 'ok', timestamp }` se ainda não existir
- [ ] 2. Confirmar que `schema.prisma` usa `url = env("DATABASE_URL")` e `directUrl = env("DIRECT_URL")`; atualizar se necessário
- [ ] 3. Atualizar `main.ts` para ler `CORS_ORIGIN` de `process.env` e configurar `app.enableCors({ origin: corsOrigin })`; nunca `origin: '*'` em produção
- [ ] 4. Atualizar `@WebSocketGateway` com `cors: { origin: process.env.CORS_ORIGIN }` consistente com o CORS do HTTP
- [ ] 5. Criar/atualizar `backend/.env.example` com todas as chaves: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `ADMIN_PASSWORD`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`, `CORS_ORIGIN`, `PORT`
- [ ] 6. Criar/atualizar `frontend/.env.example` com: `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_IMAGEKIT_PUBLIC_KEY`, `VITE_IMAGEKIT_URL_ENDPOINT`
- [ ] 7. Criar `frontend/vercel.json` com rewrite de SPA (`"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`)
- [ ] 8. Documentar no `README.md` raiz: passo a passo de Web Service no Render (build command `cd backend && npm ci && npm run build`, start command `node dist/main`, release command `npx prisma migrate deploy`, variáveis de ambiente) e projeto no Vercel (framework Vite, root `frontend`, variáveis)
- [ ] 9. Documentar no `README.md` o trade-off de cold start do plano free do Render (~50s) e recomendar cron-job.org como solução de ping (aceita como dívida técnica do MVP)
- [ ] 10. Teste manual pós-deploy: fluxo completo aluno + professor entre domínios de produção; verificar console por erros de CORS/mixed content

## Task Dependency Graph

```
2 → 3 → 4
5
6 → 7
3, 4, 5, 6, 7 → 8 → 9 → 10
1
```

## Notes

- `CORS_ORIGIN` deve apontar para a URL do Vercel em produção; em dev usa `http://localhost:5173`.
- `DIRECT_URL` é necessário para `prisma migrate deploy` no Render (Neon não suporta migrations via pooled connection).
- O `vercel.json` de SPA rewrite é obrigatório para que o React Router funcione com deep links em produção.
- Nenhum segredo real deve aparecer no `README.md` ou `.env.example` — apenas placeholders como `<sua-chave-aqui>`.
