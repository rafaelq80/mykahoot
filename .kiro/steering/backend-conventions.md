---
title: Backend Conventions
inclusion: fileMatch
fileMatchPattern: 'backend/src/**/*.ts'
---

# Convenções de Código — Backend

## Módulos

- Um módulo NestJS por domínio: `ThemeModule`, `QuizModule`, `GameModule`,
  `AdminModule`. Não criar módulo novo sem justificar em uma spec.
- `GameModule` concentra tudo relativo à sala única: `GameStateService` (estado dos
  jogadores/pergunta atual), `GameRoomService` (aberto/fechado — ver spec
  `room-lifecycle-single-room`), `GameResultsService` (persistência de resultado) e
  `GameGateway` (transporte).

## Gateway (Socket.io)

- `game.gateway.ts` é uma camada de **transporte fino**: cada `@SubscribeMessage`
  decodifica o payload, chama um método de service, e emite o(s) evento(s) de
  resposta. Nenhuma regra de negócio, nenhum cálculo de pontuação, nenhum acesso a
  `PrismaService` diretamente no gateway.
- Convenção de nomes de evento (mantida da v1, não alterar sem atualizar
  `frontend/src/types/events.ts` junto):
  - `player:*` — jogador → servidor (`player:entrar`, `player:responder`)
  - `admin:*` — professor → servidor (`admin:abrirSala`, `admin:fecharSala`,
    `admin:proximaPergunta`)
  - `game:*` — servidor → jogadores (`game:novaPergunta`, `game:resultado`,
    `game:fim`, `game:salaFechada` — novo, ver spec de sala única)
  - `admin:estado` / `admin:placar` / `admin:fim` — servidor → dashboard do professor
- **Nunca** incluir `correctIndex` em qualquer evento destinado a jogadores antes do
  fim do tempo da pergunta.

## Services

- Único ponto de acesso ao banco: `PrismaService` injetado. Nenhum `new
  PrismaClient()` fora de `prisma/prisma.service.ts`.
- `GameStateService` e `GameRoomService` guardam estado em memória (é uma sala única
  por instância do processo) — documentar isso explicitamente no topo do arquivo por
  ser uma decisão arquitetural não óbvia (não escala horizontalmente sem sticky
  session ou um store externo, mas está fora de escopo do MVP).
- Falha ao persistir no Neon não pode derrubar o jogo: logar com `Logger` do Nest,
  manter o estado em memória, tentar novamente na próxima operação de escrita.

## DTOs e validação

- Toda entrada REST usa DTO com `class-validator` (`@IsString`, `@IsInt`,
  `@IsUrl`, etc.) e `ValidationPipe` global (`whitelist: true`,
  `forbidNonWhitelisted: true`).
- Payload de evento de socket que não passa por DTO formal usa guard clauses
  explícitas no início do handler (early return + log) — documentar o formato
  esperado com a interface de `game.types.ts` como contrato.

## Qualidade

- Nenhum `console.log` em código de produção — usar `Logger` do NestJS,
  `this.logger = new Logger(NomeDoService.name)`.
- Segredos só via `ConfigService` lendo de `process.env` — nunca string literal.
- CORS restrito à origem do frontend (`CORS_ORIGIN` do `.env`), nunca `origin: '*'`
  em produção.
