# Design — Deploy (Frontend Vercel / Backend Render)

## Vercel (`frontend/vercel.json`, se necessário para SPA fallback)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Necessário porque o app usa client-side routing (React Router) — sem isso, refresh em
`/admin/dashboard` retorna 404.

Variáveis de ambiente cadastradas no painel do Vercel (Production + Preview):
`VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_IMAGEKIT_PUBLIC_KEY`,
`VITE_IMAGEKIT_URL_ENDPOINT`.

## Render (`backend`)

- **Tipo:** Web Service, runtime Node 24.
- **Build command:** `npm install && npx prisma generate && npm run build`
- **Release/pre-deploy command:** `npx prisma migrate deploy`
- **Start command:** `npm run start:prod`
- **Health check path:** `/health` (criar `AppController.getHealth()` simples
  retornando `{ status: 'ok' }` caso não exista).

Variáveis de ambiente cadastradas no painel do Render: `DATABASE_URL`, `DIRECT_URL`,
`JWT_SECRET`, `ADMIN_PASSWORD`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`,
`IMAGEKIT_URL_ENDPOINT`, `CORS_ORIGIN` (URL de produção do Vercel), `PORT` (Render
injeta automaticamente, mas manter `PORT=3000` como default local).

## CORS e Socket.io

`main.ts`:
```ts
app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true })
```

`game.gateway.ts`:
```ts
@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN, credentials: true } })
```

Em desenvolvimento local, `CORS_ORIGIN=http://localhost:5173`.

## Banco (Neon)

- `DATABASE_URL`: connection string **pooled** (via pgBouncer, porta 5432 com
  `?pgbouncer=true`), usada em runtime pela aplicação.
- `DIRECT_URL`: connection string direta, usada só por `prisma migrate deploy`
  (necessário porque migrations não funcionam bem através do pooler). Configurar
  ambas em `schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Cold start (plano free do Render)

Documentar no `README.md` do projeto: primeira requisição após inatividade pode
levar até ~60s. Mitigação opcional fora do escopo desta spec: um cron externo (ex.:
GitHub Actions agendado) fazendo `GET /health` a cada 10 minutos.

## Critérios de aceite

- Deploy do frontend na Vercel serve a SPA corretamente em rotas profundas
  (`/admin/dashboard`) após refresh.
- Deploy do backend no Render responde `GET /health` com 200.
- Conexão de socket entre o domínio do Vercel e o domínio do Render funciona sem erro
  de CORS no console do navegador.
- `npx prisma migrate deploy` roda sem erro no pipeline de release do Render.
