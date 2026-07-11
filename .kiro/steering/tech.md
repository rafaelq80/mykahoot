---
title: Tech Stack
inclusion: always
---

# Stack Técnica

Estas diretrizes valem para **todo o projeto** e têm precedência sobre qualquer padrão
antigo encontrado no histórico do repositório (a v1 usava CSS puro/CSS Modules — está
descontinuado, ver `design-system-tailwind-migration`).

| Camada              | Tecnologia                                                        |
|---------------------|--------------------------------------------------------------------|
| Backend             | NestJS (TypeScript) + `@nestjs/websockets` (Socket.io)             |
| ORM                 | Prisma 7.x com `@prisma/adapter-pg`                                 |
| Banco               | Neon (Postgres serverless) — connection string pooled (pgBouncer)  |
| Runtime             | Node.js v24                                                        |
| Frontend            | React 18 + Vite (TypeScript, `strict: true`)                       |
| Estilo              | Tailwind CSS + shadcn/ui (ver `design-system.md`)                   |
| Estado global        | Zustand                                                             |
| Formulários/validação| React Hook Form + Zod (`@hookform/resolvers/zod`)                  |
| Imagens              | ImageKit (upload assinado pelo backend, entrega via CDN)           |
| Áudio               | Elementos `<audio>` nativos + hook custom `useBackgroundMusic`; sem lib pesada |
| Auth do professor    | JWT simples, senha única via variável de ambiente (MVP)            |
| Deploy frontend      | Vercel                                                              |
| Deploy backend       | Render (Web Service)                                                |

## Por que Zustand (e não Context/Redux)

- Sem boilerplate de actions/reducers; API mínima, curva de aprendizado baixa.
- Permite selectors granulares (`useGameStore(s => s.currentQuestion)`) evitando
  re-render em cascata — importante numa tela de jogo que atualiza a cada tick de
  timer.
- Stores fora da árvore React facilitam o singleton do socket (o gateway de eventos
  escreve direto na store, sem prop drilling).

## Por que RHF + Zod

- RHF evita re-render por tecla digitada (uncontrolled inputs) — relevante em
  formulários longos como criação de pergunta com upload de imagem.
- Zod dá o schema único que também pode ser reaproveitado no backend como referência
  de contrato (os DTOs do NestJS continuam sendo a validação de borda real do
  servidor, mas devem espelhar o schema Zod do front).

## Comandos de referência

```bash
# Backend
cd backend && npm run start:dev
cd backend && npx prisma migrate dev
cd backend && npx prisma generate

# Frontend
cd frontend && npm run dev
cd frontend && npm run build
```

## Variáveis de ambiente

Nunca commitar segredos. Todo valor sensível vive em `.env` (git-ignored) e tem um
`.env.example` correspondente documentando as chaves sem valores reais.

### `backend/.env`
```
DATABASE_URL=              # Neon pooled connection string
DIRECT_URL=                 # Neon direct connection (migrations)
JWT_SECRET=
ADMIN_PASSWORD=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
CORS_ORIGIN=                # URL do frontend no Vercel
PORT=3000
```

### `frontend/.env`
```
VITE_API_URL=                # URL do backend no Render
VITE_SOCKET_URL=             # normalmente igual ao VITE_API_URL
VITE_IMAGEKIT_PUBLIC_KEY=
VITE_IMAGEKIT_URL_ENDPOINT=
```

Detalhes completos de deploy (Vercel/Render, CORS, health checks, cold start do plano
free do Render) estão em `.kiro/specs/deployment-vercel-render/`.
