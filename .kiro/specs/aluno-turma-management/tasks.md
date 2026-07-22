# Implementation Plan: Gestão de Turmas e Alunos

## Overview

CRUD de turmas e alunos para o professor, com rastreabilidade de resultados de partida por aluno/turma. Backend (TypeORM entities + REST endpoints) e frontend (página administrativa) implementados; testes automatizados pendentes.

## Tasks

### Backend

- [x] 1. Criar entidade `Turma` com campos `id`, `nome`, `createdAt` e relações `1:N Aluno`, `1:N PlayerResult`
- [x] 2. Criar `CreateTurmaDto` e `UpdateTurmaDto` com validação `class-validator`
- [x] 3. Implementar `TurmaService` (findAll com alunos, findOne, create, update, remove)
- [x] 4. Implementar `TurmaController` (`/turmas`) com leituras públicas e mutações sob `JwtAuthGuard`
- [x] 5. Criar `TurmaModule` exportando `TurmaService`
- [x] 6. Criar entidade `Aluno` com campos `id`, `turmaId`, `nome`, `createdAt`, `updatedAt`, relação `ManyToOne Turma` com `onDelete: CASCADE`, e relação `1:N PlayerResult`
- [x] 7. Criar `CreateAlunoDto` e `UpdateAlunoDto` com validação `class-validator`
- [x] 8. Implementar `AlunoService` (findAllAlunos, createAluno, updateAluno, removeAluno, findAlunoInTurma)
- [x] 9. Implementar `AlunoController` (`/turmas/:turmaId/alunos`) com leituras públicas e mutações sob `JwtAuthGuard`
- [x] 10. Criar `AlunoModule` importando `TurmaModule` e exportando `AlunoService`
- [x] 11. Adicionar colunas `turmaId` e `alunoId` (nullable) à entidade `PlayerResult` com relações `ManyToOne`
- [x] 12. Criar migration `AddAlunoIdToPlayerResult` adicionando FK `alunoId` ao banco existente
- [x] 13. Atualizar `GameGateway` (`player:entrar`) para receber `{ turmaId, alunoId, avatar }`, validar via `findAlunoInTurma`, usar `aluno.nome` como nickname, e preencher `turmaId`/`alunoId` no `PlayerResult`

### Frontend

- [x] 14. Criar tipo `Turma` em `types/turma.ts`
- [x] 15. Implementar `AdminTurmasPage` com CRUD de turmas (criar, listar, excluir com confirmação)
- [x] 16. Implementar seção de alunos na `AdminTurmasPage` (adicionar, listar, remover por turma selecionada)
- [x] 17. Integrar tab "Turmas" no `AdminPage` (navegação entre Partida/Quizzes/Turmas/Histórico)

### Pendentes

- [ ] 18. Testes unitários do `TurmaService` (findAll, create, update, remove, cascade behavior)
- [ ] 19. Testes unitários do `AlunoService` (findAll, create, update, remove, findAlunoInTurma com turma errada)
- [ ] 20. Teste de integração: deletar turma → verificar que alunos foram removidos em cascade
- [ ] 21. Teste e2e: fluxo completo player:entrar com alunoId válido vs inválido
- [ ] 22. Adicionar `UpdateTurmaDto` com validação `@IsOptional()` + `@IsString()` se não existir (confirmar)
- [ ] 23. Edição de turma e aluno no frontend (PATCH) — atualmente só há criação e exclusão na UI

## Task Dependency Graph

```
1 → 2 → 3 → 4 → 5
6 → 7 → 8 → 9 → 10
5, 10 → 11 → 12 → 13
14 → 15 → 16 → 17
13, 17 → 18, 19, 20, 21
```

## Notes

- Tasks 1–17 já estão implementadas e em produção.
- Tasks 18–23 são dívida técnica identificada — sem testes automatizados e sem edição inline na UI.
- A validação de `player:entrar` no gateway é a peça que conecta este módulo ao fluxo de jogo — qualquer alteração nas regras de pertencimento afeta diretamente a entrada na partida.
