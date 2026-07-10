# Steering: Stack e Arquitetura

Estas diretrizes se aplicam a **todo o projeto QuizLive** e devem ser respeitadas em todas as features.

## Stack

| Camada       | Tecnologia                                      |
|--------------|-------------------------------------------------|
| Backend      | NestJS (TypeScript) + `@nestjs/websockets`      |
| ORM          | Prisma                                          |
| Banco        | Neon (Postgres) — sempre usar connection string pooled (pgBouncer) |
| WebSocket    | Socket.io via NestJS Gateway                    |
| Frontend     | React 18 + Vite (TypeScript)                    |
| Estilo       | CSS Modules ou CSS puro — sem Tailwind, sem CSS-in-JS |
| Imagens      | ImageKit (upload client-side com assinatura do backend) |
| Auth         | JWT simples, senha via variável de ambiente (MVP) |
| Hospedagem   | Render — Web Service (backend) + Static Site (frontend) |

## Estrutura de Pastas

```
/
├── backend/                  # Projeto NestJS
│   ├── src/
│   │   ├── theme/            # ThemeModule
│   │   ├── quiz/             # QuizModule
│   │   ├── game/             # GameModule (GameStateService, GameGateway, GameResultsService)
│   │   ├── admin/            # AdminModule (auth)
│   │   └── prisma/           # PrismaService
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env
├── frontend/                 # Projeto React/Vite
│   ├── src/
│   │   ├── pages/            # Telas principais
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── hooks/            # Custom hooks (useSocket, useGame, useAdmin)
│   │   ├── styles/           # Tokens CSS globais (variables.css)
│   │   └── types/            # Tipos TypeScript compartilhados
│   └── .env
└── .kiro/
    ├── steering/             # Diretrizes globais (este arquivo e os demais)
    └── specs/                # Specs de features
```

## Convenções de Código

### Backend (NestJS)
- Um módulo por domínio: `ThemeModule`, `QuizModule`, `GameModule`, `AdminModule`
- DTOs com `class-validator` para toda entrada de dados via REST
- Serviços nunca acessam o banco diretamente — sempre via `PrismaService` injetado
- `GameStateService` é um singleton (`@Injectable()` no escopo padrão do NestJS); nunca instanciar fora do módulo
- Eventos WebSocket nomeados com prefixo do emissor: `player:*` (jogador → servidor), `admin:*` (professor → servidor), `game:*` (servidor → jogadores), `admin:estado`/`admin:placar`/`admin:fim` (servidor → dashboard)
- Nunca expor `correctIndex` em eventos destinados a jogadores

### Frontend (React)
- Componentes em PascalCase, arquivos `.tsx`
- Hooks customizados em `hooks/`, prefixo `use`
- Nunca conectar o socket diretamente dentro de um componente — usar o hook `useSocket` (singleton)
- Estado do jogo centralizado em `useGame` (jogador) e `useAdmin` (dashboard)
- Tokens de design sempre via variáveis CSS (`var(--color-bg)`) — nunca valores hardcoded de cor, fonte ou espaçamento

### TypeScript
- `strict: true` em ambos os projetos
- Tipos de eventos WebSocket definidos em `frontend/src/types/events.ts` e replicados/importados no backend — manter sincronia manual no MVP

## Variáveis de Ambiente

### Backend (`backend/.env`)
```
DATABASE_URL=           # Neon pooled connection string
JWT_SECRET=             # Segredo para assinar tokens
ADMIN_PASSWORD=         # Senha fixa do dashboard
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
PORT=3000
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=           # URL do backend no Render
VITE_IMAGEKIT_PUBLIC_KEY=
VITE_IMAGEKIT_URL_ENDPOINT=
```

## Regras de Qualidade

- Nenhum `console.log` em produção — usar `Logger` do NestJS no backend
- Tratar erro de persistência no Neon sem derrubar o jogo: logar o erro, manter estado em memória, tentar novamente na próxima operação
- Respeitar `prefers-reduced-motion` no frontend (remover animações de pulse/shake, manter slide-up com duração reduzida)
- Acessibilidade mínima: contraste ≥ 4.5:1 nos textos sobre os botões coloridos das alternativas, foco visível em todos os elementos interativos
