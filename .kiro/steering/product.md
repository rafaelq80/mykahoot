---
title: Product
inclusion: always
---

# Produto: MyKahoot

## O que é

Plataforma de quiz multiplayer ao vivo, estilo Kahoot, para uso em sala de aula. Um
professor projeta perguntas em tela cheia; os alunos respondem pelo próprio celular
usando um PIN de sala. Pontuação, ranking e velocidade de resposta em tempo real via
WebSocket.

## Papéis

- **Aluno (Player):** entra com PIN + nickname + avatar, responde perguntas em um grid
  de 4 alternativas geométricas coloridas, vê feedback imediato e ranking.
- **Professor (Admin):** autentica com senha, gerencia temas/quizzes/perguntas, abre e
  fecha a sala, controla o avanço das perguntas, acompanha respostas em tempo real e
  consulta relatórios de partidas encerradas.

## Regra de negócio central: sala única

Existe **apenas uma sala de jogo ativa por vez** no sistema (não é multi-tenant).

- Alunos só conseguem entrar (inserir PIN → nickname/avatar → lobby) quando o
  professor **abriu a sala** para o quiz selecionado.
- Se a sala estiver fechada, o aluno vê uma tela de **"Aguarde o professor abrir a
  sala"**, com retry automático (poll leve ou evento de socket) para liberar assim que
  a sala abrir.
- Se o professor **fechar a sala** (ou encerrar o jogo) enquanto há alunos conectados,
  todos são desconectados imediatamente e redirecionados para a tela inicial com uma
  mensagem clara de que a sessão foi encerrada pelo professor.
- Essa regra é o motivo de a spec `room-lifecycle-single-room` existir separada do
  restante do fluxo de jogo — veja `.kiro/specs/room-lifecycle-single-room/`.

## Diferenciais desta evolução (v2)

Em relação à v1 (gerada inicialmente pelo Kiro, hoje em `git log`), esta evolução:

1. Elimina componentes "god" no front (`PlayerPage.tsx`, `AdminDashboardPage.tsx`,
   `AdminQuizzesPage.tsx`) separando UI, estado e efeitos colaterais.
2. Migra a estilização de CSS Modules para **Tailwind CSS + shadcn/ui**, aplicando o
   design system "Vibrant Pulse" (ver `design-system.md`).
3. Introduz **Zustand** como fonte única de estado global no front (substitui estado
   disperso em hooks ad-hoc).
4. Introduz **React Hook Form + Zod** para todo formulário (login, CRUD de
   tema/quiz/pergunta, entrada do aluno).
5. Adiciona **música de fundo** opcional durante o jogo (tela do aluno e do professor).
6. Implementa a regra de **sala única com gate de entrada** descrita acima.
7. Confirma o fluxo de upload de imagens de pergunta via **ImageKit**.
8. Define deploy: **frontend no Vercel**, **backend no Render**, segredos sempre em
   `.env` (nunca hardcoded, nunca commitados).

## Fora de escopo (v2)

- Multi-sala / múltiplos professores simultâneos.
- Autenticação de aluno persistente (contas de aluno).
- App mobile nativo (o mobile é atendido via web responsiva).
