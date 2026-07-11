# Requirements — Estado Global com Zustand

## Contexto

A v1 mantém estado dentro de `useGame.ts` (206 linhas) e `useAdmin.ts` (136 linhas)
misturando conexão de socket, estado derivado e efeitos. Esta spec introduz Zustand
como camada de estado explícita, desacoplada da conexão.

## Requisitos

### R1 — Stores por domínio

- O SISTEMA DEVE criar `useGameStore`, `useAdminStore`, `useRoomStore` e
  `useSettingsStore` (ver `structure.md`), cada uma responsável por um único domínio
  de estado.
- O SISTEMA NÃO DEVE duplicar o mesmo dado em mais de uma store — dado derivado (ex.:
  "sou eu o líder do ranking?") é calculado por seletor, não armazenado.

### R2 — Escrita de estado só a partir de eventos de socket ou ações explícitas

- QUANDO o `useSocket` receber um evento `game:*`/`admin:*`, O SISTEMA DEVE atualizar
  a store correspondente através de uma action nomeada da própria store (ex.:
  `useGameStore.getState().setCurrentQuestion(payload)`), nunca via `set` chamado de
  dentro de um componente React.
- QUANDO um componente disparar uma ação do usuário (responder pergunta, abrir sala),
  O SISTEMA DEVE chamar uma action da store que internamente faz `socket.emit(...)` —
  o componente não conhece o nome do evento de socket diretamente.

### R3 — Seletores granulares

- O SISTEMA DEVE expor hooks derivados/seletores para os dados mais lidos (ex.:
  `useCurrentQuestion()`, `useTimeLeft()`, `useIsRoomOpen()`) para evitar
  re-subscrição de componentes a mudanças irrelevantes da store.

### R4 — Persistência mínima

- O SISTEMA DEVE persistir em `localStorage` (via middleware `persist` do Zustand)
  apenas `useSettingsStore` (preferência de música ligada/desligada, volume) — dados
  de jogo (`useGameStore`, `useAdminStore`, `useRoomStore`) nunca são persistidos,
  pois são efêmeros por partida.

### R5 — Reset de estado

- QUANDO o jogo terminar (`game:fim`) ou a sala fechar (`game:salaFechada`), O
  SISTEMA DEVE resetar `useGameStore` para seu estado inicial, para que uma nova
  sessão não herde dados da anterior.

## Fora de escopo

- Persistência de estado de jogo entre reloads de página (se o aluno atualizar a
  página no meio do jogo, ele reinicia o fluxo — comportamento aceito no MVP).
