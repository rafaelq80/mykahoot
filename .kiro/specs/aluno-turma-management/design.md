# Design: Gestão de Turmas e Alunos

## Entidades e Relacionamentos

```
┌──────────┐       1:N        ┌──────────┐       1:N        ┌──────────────┐
│  Turma   │ ───────────────▸ │  Aluno   │ ───────────────▸ │ PlayerResult │
│          │                  │          │                  │              │
│ id (PK)  │                  │ id (PK)  │                  │ alunoId (FK) │
│ nome     │                  │ turmaId  │                  │ turmaId (FK) │
│ createdAt│                  │ nome     │                  │ ...          │
└──────────┘                  │ createdAt│                  └──────────────┘
      │                       │ updatedAt│                        ▲
      │                       └──────────┘                        │
      │                                                           │
      └───────────────── 1:N ─────────────────────────────────────┘
                      (Turma → PlayerResult.turmaId)
```

### Turma (`src/turma/entities/turma.entity.ts`)

| Coluna     | Tipo       | Constraints         |
|------------|-----------|---------------------|
| id         | uuid (PK) | auto-generated      |
| nome       | varchar   | NOT NULL            |
| createdAt  | timestamp | auto (CreateDate)   |

Relações:
- `@OneToMany(() => Aluno)` — turma.alunos
- `@OneToMany(() => PlayerResult)` — turma.resultados

### Aluno (`src/aluno/entities/aluno.entity.ts`)

| Coluna     | Tipo       | Constraints                        |
|------------|-----------|-------------------------------------|
| id         | uuid (PK) | auto-generated                     |
| turmaId    | uuid (FK) | NOT NULL, onDelete CASCADE         |
| nome       | varchar   | NOT NULL                           |
| createdAt  | timestamp | auto (CreateDate)                  |
| updatedAt  | timestamp | auto (UpdateDate)                  |

Relações:
- `@ManyToOne(() => Turma)` — aluno.turma (cascade delete)
- `@OneToMany(() => PlayerResult)` — aluno.resultados

### PlayerResult (colunas relevantes)

| Coluna     | Tipo       | Constraints   |
|------------|-----------|---------------|
| turmaId    | uuid (FK) | NULLABLE      |
| alunoId    | uuid (FK) | NULLABLE, INDEX |

Relações:
- `@ManyToOne(() => Turma)` — nullable
- `@ManyToOne(() => Aluno)` — nullable

## Endpoints REST

### TurmaController (`/turmas`)

| Método | Rota          | Auth     | Descrição                             |
|--------|---------------|----------|---------------------------------------|
| GET    | /turmas       | Público  | Lista todas as turmas (c/ alunos)     |
| GET    | /turmas/:id   | Público  | Busca turma por ID (c/ alunos)        |
| POST   | /turmas       | JWT      | Cria nova turma                       |
| PATCH  | /turmas/:id   | JWT      | Atualiza nome da turma                |
| DELETE | /turmas/:id   | JWT      | Remove turma (cascade alunos), 204    |

### AlunoController (`/turmas/:turmaId/alunos`)

| Método | Rota                              | Auth     | Descrição                    |
|--------|-----------------------------------|----------|------------------------------|
| GET    | /turmas/:turmaId/alunos           | Público  | Lista alunos da turma        |
| POST   | /turmas/:turmaId/alunos           | JWT      | Adiciona aluno à turma       |
| PATCH  | /turmas/:turmaId/alunos/:alunoId  | JWT      | Atualiza nome do aluno       |
| DELETE | /turmas/:turmaId/alunos/:alunoId  | JWT      | Remove aluno, 204            |

## DTOs e Validação

- `CreateTurmaDto`: `nome` (@IsString, @IsNotEmpty)
- `UpdateTurmaDto`: partial de CreateTurmaDto
- `CreateAlunoDto`: `nome` (@IsString, @IsNotEmpty)
- `UpdateAlunoDto`: partial de CreateAlunoDto

## Módulos NestJS

- `TurmaModule` importa `TypeOrmModule.forFeature([Turma])` e `AdminModule` (para
  JwtAuthGuard). Exporta `TurmaService`.
- `AlunoModule` importa `TypeOrmModule.forFeature([Aluno])`, `AdminModule` e
  `TurmaModule` (para validar existência de turma). Exporta `AlunoService`.
- `GameModule` importa `TurmaModule` (via `AlunoService.findAlunoInTurma`) para
  validar entrada do jogador na partida.

## Frontend (AdminTurmasPage)

- Acessível pela tab "Turmas" no painel admin.
- Layout de duas colunas: lista de turmas (esquerda) + alunos da turma selecionada
  (direita).
- CRUD via fetch direto para a API REST. Mutações enviam token JWT no header.
- Feedback visual via toast flutuante temporário (3s).
- Confirmação via `confirm()` nativo antes de deletar turma ou aluno.

## Integração com o fluxo de jogo

No evento `player:entrar`, o gateway:
1. Recebe `{ turmaId, alunoId, avatar }`.
2. Chama `AlunoService.findAlunoInTurma(turmaId, alunoId)` para validar.
3. Usa `aluno.nome` como nickname (nunca texto livre do cliente).
4. Cria `PlayerResult` com `turmaId` e `alunoId` preenchidos.
5. Impede duplicidade: um mesmo `alunoId` não pode ter duas conexões simultâneas
   na mesma partida.
