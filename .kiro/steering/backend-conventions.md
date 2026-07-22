---
title: Backend Conventions
inclusion: fileMatch
fileMatchPattern: 'backend/src/**/*.ts'
---

# Convenções de Código — Backend

## Módulos

- Um módulo NestJS por domínio: `ThemeModule`, `QuizModule`, `GameModule`,
  `AdminModule`, `TurmaModule`, `AlunoModule`. Não criar módulo novo sem justificar.
- `GameModule` concentra tudo relativo à sala de jogo: `GameStateService` (estado dos
  jogadores/pergunta atual), `GameResultsService` (persistência de resultado) e
  `GameGateway` (transporte). Importa `TurmaModule` para validação de entrada.

## Gateway (Socket.io)

- `game.gateway.ts` é uma camada de **transporte fino**: cada `@SubscribeMessage`
  decodifica o payload, chama um método de service, e emite o(s) evento(s) de
  resposta. Nenhuma regra de negócio, nenhum cálculo de pontuação, nenhum acesso
  a repositório diretamente no gateway.
- Convenção de nomes de evento:
  - `player:*` — jogador → servidor (`player:entrar`, `player:responder`)
  - `admin:*` — professor → servidor (`admin:conectar`, `admin:selecionarTema`,
    `admin:liberarPergunta`, `admin:proximaPergunta`)
  - `game:*` — servidor → jogadores (`game:pergunta`, `game:resultadoPergunta`,
    `game:fim`, `game:estado`, `game:erro`)
  - `admin:estado` / `admin:placar` / `admin:fim` — servidor → dashboard do professor
- **Nunca** incluir `correctIndex` em qualquer evento destinado a jogadores antes do
  fim do tempo da pergunta.

## Acesso a dados (TypeORM)

- Acesso via **Repository pattern** do TypeORM: `TypeOrmModule.forFeature([Entity])`
  no módulo + `@InjectRepository(Entity)` no service.
- `DatabaseModule` (`src/database/database.module.ts`) é `@Global` e exporta
  `TypeOrmModule.forFeature(ENTITIES)` — repositórios disponíveis em qualquer módulo.
- **Relações entre entidades**: usar import direto da classe target:
  ```ts
  @ManyToOne(() => Theme, (theme) => theme.quizzes)
  ```
  Esse é o padrão oficial. O `MIGRATION_NOTES.md` menciona uso de string como alvo
  para evitar ciclos com ts-node, mas o código real em produção usa import direto e
  funciona — o ts-node não é usado para migrations (ver seção de migrations em
  `tech.md`). Considerar a seção de "relações em string" do MIGRATION_NOTES como
  histórica/desatualizada.
- `GameStateService` guarda estado em memória (sala única por processo) — documentar
  explicitamente no topo do arquivo.
- Falha ao persistir no Neon não pode derrubar o jogo: logar com `Logger`, manter
  estado em memória, tentar novamente na próxima escrita.

## DTOs e validação

- Toda entrada REST usa DTO com `class-validator` (`@IsString`, `@IsInt`, `@IsUrl`,
  etc.) e `ValidationPipe` global (`whitelist: true`, `forbidNonWhitelisted: true`).
- Payload de evento de socket validado com `plainToInstance` + `validate` dentro do
  handler (WebSocket não passa pelo `ValidationPipe` HTTP).

## Entidades

- Uma entidade por arquivo em `src/<modulo>/entities/<nome>.entity.ts`.
- Decorators TypeORM (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`, `@ManyToOne`
  etc.) + decorators `class-validator` na mesma classe.
- Nomes de tabela e coluna devem espelhar exatamente o schema Neon existente (PascalCase
  para tabelas, camelCase para colunas).

## Qualidade

- Nenhum `console.log` em código de produção — usar `Logger` do NestJS.
- Segredos só via `process.env` — nunca string literal.
- CORS restrito à origem do frontend em produção.
