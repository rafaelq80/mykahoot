# AUDIT.md — mykahoot: Specs (.kiro) vs Código Real

> Gerado por análise direta do repositório (clone da branch `main`), comparando
> `.kiro/steering/*`, `.kiro/specs/*` com o código-fonte real em `backend/src` e `frontend/src`.
> Objetivo: servir de base de verdade para reescrever as specs e planejar a refatoração,
> sem gastar créditos do Kiro em investigação — só em geração/consolidação.

---

## 1. Divergências CRÍTICAS (specs descrevem algo que não existe mais)

### 1.1 ORM: Prisma → TypeORM
- **Specs/steering ainda citam Prisma em:** `steering/tech.md`, `steering/structure.md`,
  `steering/backend-conventions.md`, `specs/deployment-vercel-render/*`,
  `specs/room-lifecycle-single-room/design.md`.
- **Realidade do código:** projeto usa **TypeORM** (`@nestjs/typeorm`, `typeorm-ts-node-commonjs`),
  com `backend/src/database/data-source.ts`, `database.module.ts`, `entities.ts` e migrations em
  `backend/src/database/migrations/`. Não existe mais `prisma/schema.prisma` nem `PrismaService`
  em nenhum lugar do `src`.
- **Ação:** reescrever completamente as seções de acesso a dados nas specs/steering. Todo
  `design.md` que fala em "PrismaService" ou schema `.prisma` está obsoleto.

### 1.2 Módulos novos não documentados: `aluno` e `turma`
- `backend/src/aluno/` e `backend/src/turma/` existem como módulos completos (controller,
  service, module, dto, entity) mas **não aparecem** em: README raiz, `steering/product.md`,
  `steering/structure.md`.
- Isso indica uma feature de domínio (gestão de alunos/turmas) adicionada depois que os créditos
  do Kiro acabaram — provavelmente o maior "buraco" de documentação do projeto.
- **Ação:** essa é a prioridade nº 1 de nova spec. Sem documentar isso, qualquer refatoração
  futura (sua ou de outra IA) corre risco de quebrar essa funcionalidade sem perceber.

---

## 2. Divergências estruturais (arquitetura planejada vs real)

| Planejado em `structure.md` | Existe no código? | Observação |
|---|---|---|
| `frontend/src/app/` (main.tsx, App.tsx, router) | ❌ | `main.tsx`/`App.tsx` estão soltos na raiz de `src/`, não em `app/` |
| `frontend/src/services/` (api.ts, imagekit.ts) | ❌ | Pasta não existe |
| `frontend/src/schemas/` (Zod) | ❌ | Pacote `zod` **nem está instalado** no `package.json` |
| `frontend/src/pages/admin/` e `pages/player/` (subpastas) | ⚠️ Parcial | `pages/player/` existe; páginas admin estão soltas direto em `pages/`, não em `pages/admin/` |
| `frontend/src/components/ui/` (shadcn/ui) | ❌ | Não existe — só `components/shared/` com componentes próprios |
| `backend/src/game/game-room.service.ts` (marcado "NOVO") | ❌ | Não implementado |
| `frontend/src/stores/useRoomStore.ts` (marcado "NOVO") | ❌ | Não implementado |
| Tailwind CSS | ✅ | Presente (`tailwindcss`, `@tailwindcss/vite`) — migração parcialmente real |
| Zustand | ✅ | Presente e em uso (`useGameStore`, `useAdminStore`, `useSettingsStore`) |

### Páginas extras não previstas no plano original
`AdminPage.tsx`, `AdminTurmasPage.tsx`, `PlayerPage.tsx` — existem no código mas não constam
na árvore de arquivos do `structure.md`. Provavelmente ligadas aos módulos `aluno`/`turma`.

---

## 3. Status real de cada spec (tasks.md) — o que foi de fato implementado

| Spec | Tasks concluídas | Tasks pendentes | Situação real (confirmada no código) |
|---|---|---|---|
| `frontend-component-architecture` | 8 | 10 | Maior parte feita |
| `state-management-zustand` | 4 | 7 | Parcialmente feita (confirma Zustand real) |
| `design-system-tailwind-migration` | 4 | 9 | Parcial — Tailwind sim, shadcn/ui não |
| `forms-validation` | 0 | 10 | **Genuinamente não implementada** — `react-hook-form` e `zod` nem estão instalados no `package.json` |
| `image-upload-imagekit` | 0 | 8 | ✅ Implementada e funcional, mas artesanal: função `uploadToImageKit` **duplicada** em `EditQuizPage.tsx` e `AdminQuizzesPage.tsx`, sem validação de tipo/tamanho, sem indicador de progresso. Spec + refatoração em duas partes (ver `PROMPTS-KIRO.md`, 3b) |
| `game-background-music` | 0 | 9 | ⚠️ Implementada, mas **escopo será alterado**: remover sintetizador (só áudio estático), música de fundo passa a tocar só no admin (para compartilhamento de tela), sting de acerto/erro continua no aluno |
| `deployment-vercel-render` | 0 | 10 | Correta em conteúdo (Vercel + Render confirmado pelo usuário); só precisa da nota sobre `frontend/render.yaml` legado |
| `room-lifecycle-single-room` | 0 | 16 | ✅ Implementada, com 2 lacunas reais confirmadas: retry automático ausente (implementação pendente) e recuperação de sessão interrompida **já existe** mas estava documentada no arquivo errado (é `game-results.service.ts`, não `game-state.service.ts`) |

> **Conclusão da triagem:** das 4 specs que apareciam com "0 tasks concluídas", 3 já estão
> implementadas em produção — o Kiro só nunca marcou porque o trabalho foi feito manualmente
> depois que os créditos acabaram. Só `forms-validation` é uma lacuna real (RHF + Zod não
> instalados). Isso muda a prioridade: as 3 specs "fantasma" viram simples trabalho de
> documentação retroativa (barato), e `forms-validation` vira uma decisão de produto — vale a
> pena implementar agora, ou arquivar a spec até ser prioridade de fato?

---

## 4. Outras inconsistências encontradas

- **Deploy:** confirmado pelo usuário que o frontend vai para **Vercel** (não Render), então a
  spec `deployment-vercel-render` está correta nesse ponto. O `frontend/render.yaml` existente no
  repo é resquício de uma configuração não utilizada/abandonada — **não apagar sem confirmar
  antes**, mas não deve ser tratado como fonte de verdade. Vale adicionar uma nota na spec
  explicando que esse arquivo é legado, para evitar confusão futura (inclusive minha, ao ler o
  código sem esse contexto). O backend continua no Render (`backend/render.yaml` é real e usado).
- **`MIGRATION_NOTES.md`** existe em `backend/` (fora do `.kiro`) — **já documenta tecnicamente
  toda a migração Prisma → TypeORM**, e é rico o suficiente para servir de base direta da nova
  spec, sem precisar re-derivar nada do código. Pontos-chave que precisam virar convenção
  oficial em `steering/backend-conventions.md`:
  - Entidades cobertas: `Admin`, `Theme`, `Quiz`, `Question`, `Turma`, `Aluno`, `GameSession`,
    `PlayerResult` — ou seja, `Turma`/`Aluno` **já eram esperadas** desde a migração, só não
    foram propagadas para `product.md`/`structure.md`.
  - `synchronize: false` sempre — schema só muda via migration explícita.
  - **Padrão obrigatório para relações entre entidades:** usar o nome da entidade em **string**
    no decorator (`@ManyToOne('Quiz', (quiz: Quiz) => quiz.questions)`) e `import type` para o
    tipo TS — nunca importar a classe da entidade relacionada por valor. Motivo: entidades têm
    referências cíclicas entre si (Quiz↔Question, Theme↔Quiz, Turma↔Aluno, GameSession↔PlayerResult)
    e um import de valor circular quebra o `ts-node` da CLI de migrations
    (`ERR_REQUIRE_CYCLE_MODULE`). **Essa regra precisa estar documentada como convenção
    obrigatória**, porque não é óbvia e qualquer nova entidade relacionada vai reintroduzir o bug
    se não seguir o padrão.
  - Scripts `migration:run`/`migration:revert` sempre buildam para `dist/` antes de rodar a CLI
    (mesma razão: incompatibilidade do wrapper ts-node da CLI TypeORM com Node recente).
  - Migration `InitialSchema` é só para banco novo vazio; o banco Neon existente precisa da
    migration incremental que adiciona `alunoId` em `PlayerResult`.

---

## 5. Plano de ação sugerido (ordem de prioridade)

1. **Ler `backend/MIGRATION_NOTES.md`** (grátis, sem IA) — provavelmente já documenta a decisão
   Prisma → TypeORM e evita retrabalho.
2. **Nova spec: `aluno-turma-management`** — é o maior gap. Gerar requirements+design a partir
   do código real de `backend/src/aluno` e `backend/src/turma` + páginas
   `AdminTurmasPage.tsx`/`AdminPage.tsx`.
3. **Atualizar `steering/tech.md`, `steering/structure.md`, `steering/backend-conventions.md`**
   substituindo todas as referências a Prisma por TypeORM e corrigindo a árvore de pastas real.
4. **Revisar `specs/deployment-vercel-render`** — nome e conteúdo já batem com a realidade
   (Vercel no front, Render no back). Só adicionar uma nota curta sobre o `frontend/render.yaml`
   ser legado/não utilizado, para não confundir quem ler o repo depois.
5. **Reescrever as 3 specs "fantasma"** (`game-background-music`, `image-upload-imagekit`,
   `room-lifecycle-single-room`) a partir do código real — já confirmadas como implementadas,
   é trabalho de documentação retroativa, não de investigação. Ver prompts prontos em
   `PROMPTS-KIRO.md`, Fase 3.
6. **Decidir o destino de `forms-validation`** — essa é a única lacuna real. Implementar agora
   (instalar RHF + Zod) ou arquivar a spec até virar prioridade — decisão de produto, não técnica.
6. **Só depois de specs atualizadas**, iniciar refatoração de código propriamente dita,
   priorizando os módulos centrais (`game/`, `quiz/`) antes de estrutura de pastas
   (`app/`, `services/`, `schemas/`) — que é cosmético e pode ser feito manualmente sem IA.

---

## 6. O que pode ser feito SEM gastar créditos do Kiro

- Mover `main.tsx`/`App.tsx` para `src/app/` → refactor mecânico, `git mv` + ajuste de imports.
- Criar `src/services/api.ts` centralizando chamadas HTTP hoje espalhadas — mecânico.
- Rodar `eslint --fix` / `prettier` no projeto todo — grátis.
- Corrigir referências a Prisma nos arquivos `.kiro/steering/*.md` — é edição de texto, pode ser
  feito manualmente com find & replace assistido, sem precisar de raciocínio de IA.