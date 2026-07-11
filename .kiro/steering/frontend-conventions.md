---
title: Frontend Conventions
inclusion: fileMatch
fileMatchPattern: 'frontend/src/**/*.{ts,tsx}'
---

# Convenções de Código — Frontend

## Componentes

- Um componente por arquivo, PascalCase, `.tsx`. Export default só em `pages/*`; tudo
  em `features/` e `components/` usa named export.
- Limite prático de **~150 linhas** por componente. Se ultrapassar, extrair
  sub-componente ou hook (ver `component-size-guard.kiro.hook`).
- Nenhum componente de `pages/` pode conter `useEffect` com lógica de socket, cálculo
  de pontuação ou parsing de payload — isso pertence a um hook de `features/*/hooks`
  ou a um store.

## Custom hooks

- Prefixo `use`, um hook por arquivo.
- Hooks técnicos/transversais (socket, música, countdown) ficam em `src/hooks/`.
- Hooks de domínio (ex.: `useJoinRoom`, `useQuestionFlow`, `useQuizEditor`) ficam
  dentro da feature correspondente: `features/<feature>/hooks/`.
- Um hook nunca deve depender de outro hook de UI (ex.: `useJoinRoom` não deve chamar
  `useState` de um componente pai) — comunicação entre hooks acontece via store
  Zustand.
- `useSocket` é **singleton**: a conexão é criada uma única vez fora do ciclo de
  render (módulo-level ou dentro da store) e reexportada. Nenhum componente chama
  `io(...)` diretamente.

## Estado (Zustand)

- Uma store por domínio (ver `structure.md` → `stores/`). Não criar uma store
  "global" única com tudo dentro.
- Selectors granulares: `useGameStore((s) => s.currentQuestion)`, nunca
  `const state = useGameStore()` desestruturando tudo (causa re-render desnecessário).
- Actions que mexem em estado de socket ficam dentro da própria store (`set` chamado
  a partir do listener registrado em `useSocket`), nunca em um componente.
- Estado de formulário **não** vai para Zustand — vive no `useForm` do React Hook
  Form. Zustand só guarda estado que precisa ser lido fora do form.

## Formulários (React Hook Form + Zod)

- Todo formulário tem um schema Zod correspondente em `schemas/<nome>.schema.ts`.
- `useForm({ resolver: zodResolver(schema) })` é o único jeito de validar formulário —
  nunca validação manual em `onSubmit`.
- Reaproveitar o tipo inferido do schema (`z.infer<typeof schema>`) como tipo do form,
  nunca duplicar a interface à mão.
- Mensagens de erro em português, curtas, ao lado do campo (usar `FormMessage` do
  shadcn).

## Estilo (Tailwind + shadcn)

- Ver `design-system.md` para tokens. Nunca usar cor/espaçamento/fonte hardcoded fora
  do `tailwind.config.ts`.
- Compor classes condicionais com `cn()` (`lib/utils.ts`, wrapper de `clsx` +
  `tailwind-merge`), nunca concatenação manual de string.
- Componentes shadcn gerados em `components/ui/` não são editados diretamente — se
  precisar de uma variante, estender via `class-variance-authority` no próprio
  arquivo gerado (padrão shadcn) ou compor por fora.

## TypeScript

- `strict: true`. Nenhum `any` implícito; `unknown` + narrowing quando o tipo vem de
  fora (payload de socket, resposta HTTP).
- Tipos de evento de socket vivem em `src/types/events.ts` e devem espelhar
  exatamente `backend/src/game/game.types.ts` — ver hook
  `sync-websocket-event-types.kiro.hook`.

## Testes

- Todo componente em `features/*/components` e todo hook em `features/*/hooks` tem
  teste correspondente (`*.test.tsx` / `*.test.ts`) usando Vitest + Testing Library.
- Mockar o socket via um `createMockSocket()` de teste, nunca conectar de verdade em
  teste unitário.
