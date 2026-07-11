# Requirements — Upload de Imagem de Pergunta via ImageKit

## Contexto

O backend já expõe `GET /imagekit/auth` (`backend/src/quiz/imagekit.controller.ts`)
retornando os parâmetros de assinatura para upload client-side. Falta o consumo
correto no frontend, integrado ao formulário de pergunta (RHF + Zod) e ao novo
design system.

## Requisitos

### R1 — Upload client-side assinado

- QUANDO o professor selecionar um arquivo de imagem no `QuestionForm`, O SISTEMA
  DEVE buscar os parâmetros de assinatura em `GET /imagekit/auth` e enviar o arquivo
  diretamente para o ImageKit a partir do navegador (o backend nunca recebe o
  binário da imagem).
- QUANDO o upload terminar com sucesso, O SISTEMA DEVE preencher o campo `imageUrl`
  do formulário com a URL retornada pelo ImageKit.

### R2 — Validação de arquivo

- O SISTEMA DEVE aceitar apenas arquivos `image/jpeg`, `image/png`, `image/webp`.
- O SISTEMA DEVE rejeitar arquivos maiores que 5 MB, com mensagem clara antes de
  iniciar o upload (não depois de já ter enviado).

### R3 — Feedback de progresso e erro

- ENQUANTO o upload estiver em andamento, O SISTEMA DEVE exibir uma barra/indicador
  de progresso e desabilitar o submit do formulário de pergunta.
- SE o upload falhar (rede, erro do ImageKit, credenciais ausentes — o backend já
  retorna 503 nesse caso), ENTÃO O SISTEMA DEVE exibir um toast de erro claro e
  permitir nova tentativa sem perder o restante dos dados do formulário.

### R4 — Preview e substituição

- QUANDO uma imagem já estiver associada à pergunta (edição), O SISTEMA DEVE exibir
  o preview atual antes de qualquer novo upload.
- O SISTEMA DEVE permitir remover a imagem atual (campo `imageUrl` volta a
  `undefined`) sem exigir escolher uma nova.

### R5 — Segurança

- O SISTEMA NÃO DEVE expor `IMAGEKIT_PRIVATE_KEY` em nenhum artefato do frontend —
  ela existe apenas em `backend/.env` e é usada só para gerar os parâmetros de
  assinatura.

## Fora de escopo

- Edição de imagem (crop/resize) no cliente — upload é do arquivo original.
- Galeria de imagens reaproveitáveis entre perguntas.
