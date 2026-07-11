# Design — Formulários com React Hook Form + Zod

## Padrão de implementação (repetido em todo formulário)

```ts
// schemas/joinRoom.schema.ts
export const joinRoomSchema = z.object({
  nickname: z.string().trim().min(2, 'Mínimo 2 caracteres').max(20, 'Máximo 20 caracteres'),
  avatar: z.string().min(1, 'Escolha um avatar'),
})
export type JoinRoomInput = z.infer<typeof joinRoomSchema>
```

```tsx
// features/player-session/hooks/useJoinRoom.ts
const form = useForm<JoinRoomInput>({
  resolver: zodResolver(joinRoomSchema),
  defaultValues: { nickname: '', avatar: '' },
})

function onSubmit(data: JoinRoomInput) {
  useGameStore.getState().join(data) // action que faz socket.emit internamente
}
```

Componente de UI recebe `form` (ou usa `FormProvider`) e renderiza campos com os
componentes shadcn `Form`, `FormField`, `FormItem`, `FormMessage`.

## Schemas a criar

| Arquivo | Usado por |
|---|---|
| `schemas/joinRoom.schema.ts` | `JoinRoomForm` (nickname + avatar) |
| `schemas/adminLogin.schema.ts` | `AdminLoginPage` |
| `schemas/theme.schema.ts` | `ThemeForm` |
| `schemas/quiz.schema.ts` | `QuizForm` |
| `schemas/question.schema.ts` | `QuestionForm` (inclui campo de imagem — ver spec `image-upload-imagekit` para o refine de arquivo) |

## Exemplo — schema de pergunta (o mais complexo)

```ts
export const questionSchema = z.object({
  text: z.string().trim().min(1).max(300),
  options: z.array(z.string().trim().min(1).max(120)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  timeLimitSec: z.number().int().min(5).max(120).default(20),
  imageUrl: z.string().url().optional(),
})
export type QuestionInput = z.infer<typeof questionSchema>
```

O campo `imageUrl` é preenchido depois do upload assíncrono para o ImageKit (o
formulário não envia o arquivo bruto no mesmo submit — ver spec própria).

## Espelhamento com o backend

Cada schema Zod tem um comentário apontando o DTO NestJS equivalente:

```ts
// Espelha backend/src/quiz/dto/create-question.dto.ts — manter limites sincronizados
```

O hook `sync-websocket-event-types.kiro.hook` cobre eventos de socket; para DTOs REST
não há automação de sincronia no MVP — é responsabilidade de quem editar um dos dois
lados atualizar o outro (registrado aqui como dívida aceita, candidato a um hook
futuro `sync-dto-schemas`).

## Critérios de aceite

- Todo `<form>` do projeto usa `useForm` + `zodResolver`.
- Nenhuma validação manual (`if (!value) setError(...)`) fora do schema Zod.
- Erros de campo aparecem em português, ao lado do campo correspondente.
