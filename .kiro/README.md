# `.kiro/` — MyKahoot v2

Este diretório é o **único artefato gerado nesta rodada** (conforme solicitado): só
especificação, nenhum código de aplicação. Ele foi desenhado para ser consumido pelo
Kiro na geração do código real, em outra etapa.

## Por que dividido assim (e como isso economiza tokens/contexto)

- **`steering/`** — carregado conforme a regra `inclusion` do front-matter de cada
  arquivo:
  - `inclusion: always` (`product.md`, `tech.md`, `structure.md`,
    `security-and-env.md`) → sempre no contexto, pois valem para qualquer tarefa.
  - `inclusion: fileMatch` (`design-system.md`, `frontend-conventions.md`,
    `backend-conventions.md`) → só entram no contexto quando o Kiro está de fato
    tocando em arquivo do front ou do back, evitando gastar tokens com regras de
    Tailwind ao editar um `.controller.ts`, por exemplo.
- **`specs/<feature>/`** — cada feature tem seu próprio `requirements.md` (EARS),
  `design.md` e `tasks.md`, isolados das demais. Ao trabalhar na spec de música, o
  Kiro não precisa carregar a spec inteira de sala única — só referencia por nome
  quando há dependência real (ex.: `room-lifecycle-single-room` é citada em
  `state-management-zustand` só na exata linha onde a dependência existe).
- **`hooks/`** — automação orientada a evento, não a "lembrar de seguir a regra":
  regras de estilo/arquitetura tendem a ser esquecidas em contexto longo; hooks
  disparam independentemente de quanto contexto já foi consumido na conversa.

## Ordem sugerida de execução das specs

1. `frontend-component-architecture` — reorganiza a casa antes de estilizar ou trocar
   estado, para não migrar CSS/estado de um componente que vai ser deletado.
2. `state-management-zustand` — junto ou logo após (1), já que a nova estrutura de
   pastas depende das stores.
3. `design-system-tailwind-migration` — depois de (1), tela a tela.
4. `forms-validation` — pode andar em paralelo a (3), formulário a formulário.
5. `room-lifecycle-single-room` — feature de negócio nova, backend + frontend.
6. `image-upload-imagekit` — depende de (4) (schema de pergunta) e de (1)
   (`QuestionForm` já extraído).
7. `game-background-music` — independente, pode entrar a qualquer momento após (2).
8. `deployment-vercel-render` — por último, quando o app já está funcionalmente
   pronto.

## Especificações antigas

O `.kiro/` anterior deste repositório (projeto "QuizLive", tema escuro "arcade neon",
`sem Tailwind`) foi **substituído** por completo. Os arquivos antigos
(`steering/frontend-design.md`, `steering/stack.md`, `specs/requirements.md`,
`specs/design.md`, `specs/tasks.md`) não devem mais ser usados como referência — o
nome do produto e a stack mudaram para o que está descrito em `steering/product.md` e
`steering/tech.md`.
