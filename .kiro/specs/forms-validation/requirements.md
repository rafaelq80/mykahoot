# Requirements — Formulários com React Hook Form + Zod

## Requisitos

### R1 — Cobertura

- O SISTEMA DEVE validar com React Hook Form + Zod todos os formulários da
  aplicação: entrada do aluno (nickname/avatar), login do professor, criação/edição
  de tema, criação/edição de quiz, criação/edição de pergunta (incluindo upload de
  imagem).

### R2 — Schema único por formulário

- O SISTEMA DEVE definir um arquivo `schemas/<nome>.schema.ts` por formulário,
  exportando o `ZodSchema` e o tipo inferido (`z.infer`).
- QUANDO um DTO do backend validar o mesmo formato de dado (ex.: criação de
  pergunta), O SISTEMA DEVE manter o schema Zod do frontend e o DTO
  `class-validator` do backend com as mesmas regras (mesmos limites de tamanho,
  mesmos campos obrigatórios) — divergência entre os dois é bug.

### R3 — Regras específicas de validação

- Nickname do aluno: obrigatório, 2–20 caracteres, sem caracteres de controle.
- PIN de sala: obrigatório, exatamente o formato numérico definido pelo backend
  (confirmar tamanho no `game-state.service.ts` — hoje a sala é única e não usa PIN
  variável por quiz, então este campo é reavaliado junto da spec
  `room-lifecycle-single-room`; se o PIN for fixo por sessão, o campo de PIN pode ser
  substituído por a tela de espera automática).
- Senha do professor: obrigatória, sem limite de formato exposto no client (evitar
  vazar regra de senha).
- Pergunta: texto obrigatório (1–300 caracteres), exatamente 4 alternativas
  obrigatórias (1–120 caracteres cada), `correctIndex` obrigatório entre 0–3,
  `timeLimitSec` entre 5–120, imagem opcional (ver spec `image-upload-imagekit` para
  validação de arquivo).
- Quiz: título obrigatório (1–100 caracteres), tema obrigatório (seleção de um
  `Theme` existente).
- Tema: nome obrigatório (1–60 caracteres), descrição opcional (até 300 caracteres).

### R4 — Feedback de erro

- QUANDO a validação falhar, O SISTEMA DEVE exibir a mensagem de erro em português,
  junto ao campo (`FormMessage` do shadcn), e impedir o submit até a correção.
- QUANDO a submissão HTTP falhar (erro de rede ou 4xx/5xx do backend), O SISTEMA DEVE
  exibir um toast de erro (shadcn `Sonner`) sem perder os dados já preenchidos no
  formulário.

## Fora de escopo

- Validação assíncrona de unicidade (ex.: nickname duplicado na sala) fica a cargo do
  backend/gateway, retornando erro que o formulário exibe — não é um refine
  assíncrono do Zod no MVP.
