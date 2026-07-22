# Requirements: Gestão de Turmas e Alunos

## Introdução

O professor precisa cadastrar turmas e alunos previamente para que, durante uma
partida ao vivo, o sistema identifique cada jogador pelo seu registro real (em vez
de nickname livre). Isso permite rastrear desempenho individual ao longo do tempo e
agrupar relatórios por turma.

## Requisitos Funcionais

### RF-1: CRUD de Turma

O professor autenticado pode criar, listar, editar e excluir turmas.

**Campos**: `nome` (string, obrigatório, não-vazio).

**Regras**:
- Leitura (listar todas, buscar por id) é pública — a tela de ingresso do aluno
  precisa consultar turmas sem estar autenticada como admin.
- Criação, edição e exclusão exigem autenticação JWT do professor.
- Listagem retorna turmas ordenadas por nome (ASC) com os alunos de cada turma
  incluídos na resposta (`relations: alunos`).

### RF-2: Cascade delete Turma → Alunos

Ao excluir uma turma, todos os alunos vinculados a ela são removidos
automaticamente (`onDelete: CASCADE` na FK `turmaId` da entidade Aluno).

### RF-3: CRUD de Aluno (aninhado sob Turma)

O professor autenticado pode adicionar, listar, editar e remover alunos dentro
de uma turma específica.

**Campos**: `nome` (string, obrigatório, não-vazio).

**Regras**:
- As rotas de aluno são aninhadas: `/turmas/:turmaId/alunos`.
- Antes de qualquer operação de aluno, o sistema valida que a turma existe
  (404 se não existir).
- Leitura (listar alunos de uma turma) é pública.
- Criação, edição e exclusão exigem autenticação JWT.
- Listagem retorna alunos ordenados por nome (ASC).

### RF-4: Validação de pertencimento (Aluno ∈ Turma)

O método `findAlunoInTurma(turmaId, alunoId)` confirma que o aluno existe **e**
que `aluno.turmaId === turmaId`. Retorna 404 caso contrário.

Esse predicado é reutilizado pelo `GameGateway` no evento `player:entrar` para
garantir que apenas alunos cadastrados em uma turma válida entrem na partida.

### RF-5: Rastreabilidade de resultados por Aluno/Turma

`PlayerResult` possui FKs opcionais `alunoId` e `turmaId`. Quando um aluno
identificado entra na partida, seu resultado fica vinculado ao cadastro, permitindo
consultas históricas por turma ou por aluno individual.

### RF-6: Interface administrativa (Frontend)

A tela `AdminTurmasPage` permite ao professor:
- Criar e excluir turmas (com confirmação antes de deletar).
- Selecionar uma turma para ver e gerenciar seus alunos.
- Adicionar e remover alunos da turma selecionada.
- Feedback visual de sucesso/erro (toast temporário).

## Requisitos Não-Funcionais

- Validação no backend via `class-validator` com `ValidationPipe` global.
- Nenhum endpoint expõe dados sensíveis (alunos são só `id` + `nome`).
- As operações de CRUD devem ser idempotentes e seguras contra double-click (frontend
  desabilita botões durante requisição).
