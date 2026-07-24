# MyKahoot

Aplicação de quiz em tempo real estilo Kahoot, com controle pelo professor.

## Estrutura do Monorepo

```
/
├── backend/          # API NestJS (REST + WebSocket via Socket.io)
│   ├── src/
│   │   ├── theme/    # ThemeModule — CRUD de temas
│   │   ├── quiz/     # QuizModule — CRUD de quizzes e perguntas
│   │   ├── game/     # GameModule — estado em memória, gateway WS, resultados
│   │   ├── admin/    # AdminModule — autenticação JWT
│   │   └── prisma/   # PrismaService
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env          # variáveis de ambiente (não versionado)
│
├── frontend/         # SPA React 18 + Vite (TypeScript)
│   ├── src/
│   │   ├── pages/        # Telas principais
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── hooks/        # useSocket, useGame, useAdmin
│   │   ├── styles/       # Tokens CSS globais (variables.css)
│   │   └── types/        # Tipos TypeScript (eventos WS, etc.)
│   └── .env          # variáveis de ambiente (não versionado)
│
└── .kiro/            # Specs e steering do projeto
```

## Stack

| Camada     | Tecnologia                              |
|------------|-----------------------------------------|
| Backend    | NestJS (TypeScript) + Socket.io         |
| ORM        | Prisma                                  |
| Banco      | Neon Postgres (pooled)                  |
| Frontend   | React 18 + Vite (TypeScript)            |
| Estilo     | CSS Modules / CSS puro (sem Tailwind)   |
| Imagens    | ImageKit                                |
| Auth       | JWT (senha via variável de ambiente)    |
| Deploy     | Render (Web Service + Static Site)      |

## Primeiros Passos

### Pré-requisitos
- Node.js 20+
- Conta no [Neon](https://neon.tech) (Postgres)
- Conta no [ImageKit](https://imagekit.io)

### Backend

```bash
cd backend
cp .env.example .env   # preencha as variáveis
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

### Frontend

```bash
cd frontend
cp .env.example .env   # preencha as variáveis
npm install
npm run dev
```

## Variáveis de Ambiente

### `backend/.env`

| Variável               | Descrição                                 |
|------------------------|-------------------------------------------|
| `DATABASE_URL`         | Connection string pooled do Neon          |
| `JWT_SECRET`           | Segredo para assinar tokens JWT           |
| `ADMIN_PASSWORD`       | Senha fixa do dashboard do professor      |
| `IMAGEKIT_PUBLIC_KEY`  | Chave pública do ImageKit                 |
| `IMAGEKIT_PRIVATE_KEY` | Chave privada do ImageKit                 |
| `IMAGEKIT_URL_ENDPOINT`| URL endpoint do ImageKit                  |
| `PORT`                 | Porta do servidor (padrão: 3000)          |

### `frontend/.env`

| Variável                     | Descrição                         |
|------------------------------|-----------------------------------|
| `VITE_API_URL`               | URL do backend                    |
| `VITE_IMAGEKIT_PUBLIC_KEY`   | Chave pública do ImageKit         |
| `VITE_IMAGEKIT_URL_ENDPOINT` | URL endpoint do ImageKit          |
