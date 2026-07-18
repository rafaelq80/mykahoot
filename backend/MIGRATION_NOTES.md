# Migração Prisma → TypeORM

## O que mudou

**ORM**
- Removido: `@prisma/client`, `@prisma/adapter-pg`, `@prisma/adapter-neon`, `@neondatabase/serverless`, `prisma` (CLI), `prisma/schema.prisma`, `PrismaModule`/`PrismaService`.
- Adicionado: `typeorm`, `@nestjs/typeorm`, `src/database/database.module.ts` (substitui o `PrismaModule`, `@Global`, exporta os repositórios de todas as entidades) e `src/database/data-source.ts` (usado só pela CLI do TypeORM para rodar migrations).
- `synchronize: false` sempre — schema controlado só por migrations, nunca gerado automaticamente.

**Entidades** (`src/*/entities/*.entity.ts`)
- `Admin`, `Theme`, `Quiz`, `Question`, `Turma`, `Aluno`, `GameSession`, `PlayerResult`.
- Nomes de tabela e coluna idênticos ao `schema.prisma` original, para o banco Neon existente continuar funcionando sem recriar nada.
- Cada entidade tem decorators `class-validator` (`@IsString`, `@IsUUID`, `@IsOptional` etc.) além dos decorators do TypeORM.
- **Relações usam o nome da entidade em string** (ex.: `@ManyToOne('Quiz', (quiz: Quiz) => quiz.questions)`) em vez de referenciar a classe diretamente (`() => Quiz`), e o tipo TS vem de `import type`. Isso é proposital: como as entidades se referenciam em ciclo (Quiz↔Question, Theme↔Quiz, Turma↔Aluno, GameSession↔PlayerResult...), um import de **valor** circular entre elas quebra o loader do `ts-node` usado pela CLI de migrations (`ERR_REQUIRE_CYCLE_MODULE`). Com `import type` + alvo em string, não há import de valor circular — só de tipo, que é apagado na compilação. Ao criar uma nova entidade com relação para outra que já existe no ciclo, siga o mesmo padrão.

**Módulos** — cada domínio ficou com `entities/`, `dto/`, `*.service.ts`, `*.controller.ts` e `*.module.ts` próprios, com `TypeOrmModule.forFeature([...])` local. `GameModule` agora importa `TurmaModule` (necessário para a validação abaixo).

**Migrations** (`src/database/migrations/`)
- `1752400000000-InitialSchema.ts`: cria o schema do zero — use só em banco **novo**, vazio.
- `1752400000001-AddAlunoIdToPlayerResult.ts`: adiciona a coluna `alunoId` em `PlayerResult` — é a que você deve rodar no banco **Neon existente** (que já tem as tabelas criadas pelo Prisma).

Rodar migrations:
```bash
npm run migration:run       # builda e aplica (contra dist/)
npm run migration:revert    # builda e desfaz a última
npm run migration:generate -- src/database/migrations/NomeDaMigration
```

### Por que os scripts buildam antes de rodar a CLI

`typeorm-ts-node-esm`/`typeorm-ts-node-commonjs` (os wrappers de ts-node que a CLI do TypeORM normalmente usa para ler `.ts` direto) têm um bug conhecido de incompatibilidade com versões recentes do Node — falha com `ERR_REQUIRE_CYCLE_MODULE` mesmo em arquivos triviais sem nenhuma relação circular real, só por causa de como o loader ESM deles interage com decorators/`reflect-metadata`. Não é algo relacionado ao código deste projeto.

A solução usada aqui: os scripts `migration:*` primeiro rodam `npm run build` (gera `dist/`) e depois chamam a CLI `typeorm` **pura**, sem ts-node, apontando para `dist/database/data-source.js` já compilado. Isso evita o loader problemático por completo. `data-source.ts` usa `__dirname` para resolver o caminho das migrations, então isso só funciona rodando contra o `dist/` (não direto contra o `src/` via ts-node) — é assim de propósito.

Se quiser rodar manualmente sem os scripts do `package.json`:
```bash
npm run build
npx typeorm migration:run -d dist/database/data-source.js
```


## O bug corrigido: entrada do aluno na turma

Antes, `player:entrar` recebia `{ nickname, avatar, turmaId }`: só validava se a `turma` existia, sem checar se o aluno pertencia a ela — qualquer pessoa digitava qualquer nome e entrava em qualquer turma.

Agora:
1. O payload é `{ turmaId, alunoId, avatar }` (`EntrarDto`, validado com `class-validator` via `plainToInstance` + `validate` dentro do gateway, já que WebSocket não passa pelo `ValidationPipe` do HTTP).
2. `TurmaService.findAlunoInTurma(turmaId, alunoId)` confirma que o aluno existe **e** que `aluno.turmaId === turmaId`; caso contrário, o cliente recebe `game:erro` e não entra.
3. O nickname exibido é sempre `aluno.nome` (do cadastro) — nunca mais um texto livre do cliente.
4. Um mesmo aluno não pode ocupar duas conexões simultâneas na mesma partida (`GameStateService.adicionarJogador` agora rastreia `alunoId`).
5. `PlayerResult` ganhou a coluna `alunoId` (FK para `Aluno`), então cada resultado fica rastreável até o aluno real que jogou.

**Impacto no frontend:** a tela de entrada do aluno precisa passar a mandar `alunoId` em vez de um nickname livre — ou seja, o aluno passa a escolher/selecionar a si mesmo dentro da turma (ex.: dropdown populado por `GET /turmas/:id/alunos`), em vez de digitar o nome.

## Rodando localmente
```bash
npm install
npm run migration:run   # só a AddAlunoIdToPlayerResult, se o banco já existe
npx typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts
npm run start:dev
```
