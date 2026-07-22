# Design — Upload de Imagem via ImageKit

## Arquitetura real (implementada)

### Backend

```
GET /imagekit/auth  →  ImageKitController (QuizModule)
                       @UseGuards(JwtAuthGuard)
                       ↓
                       ImageKit SDK (@imagekit/nodejs)
                       .helper.getAuthenticationParameters()
                       ↓
                       { signature, expire, token }
```

- Controller: `backend/src/quiz/imagekit.controller.ts`
- Registrado em: `QuizModule` (quiz.module.ts)
- SDK: instanciado com privateKey de process.env
- Se env vars ausentes: `this.imagekit = null` → endpoint retorna 503

### Frontend — Fluxo de upload

```
1. Professor seleciona arquivo no input[type=file]
2. Frontend chama GET /imagekit/auth (com Bearer token)
3. Recebe { token, expire, signature }
4. Monta FormData:
   - file: File selecionado
   - fileName: file.name
   - publicKey: VITE_IMAGEKIT_PUBLIC_KEY
   - signature, expire, token: do passo 3
5. POST para {VITE_IMAGEKIT_URL_ENDPOINT}/api/v1/files/upload
6. Resposta: { url: "https://ik.imagekit.io/..." }
7. URL é salva como imageUrl do Quiz ou Question via PATCH/POST
```

### Implementação atual (inline, duplicada)

A função `uploadToImageKit(file: File, token: string): Promise<string | null>` está
implementada identicamente em:
- `frontend/src/pages/AdminQuizzesPage.tsx` (upload de imagem de pergunta na criação)
- `frontend/src/features/admin-control/components/EditQuizPage.tsx` (upload de imagem do quiz na edição)

Não existe componente isolado `ImageUploadField` nem serviço centralizado — o upload
é feito inline dentro de cada formulário.

### Onde `imageUrl` é persistido

| Entidade   | Coluna     | Tipo            | Uso                               |
|------------|-----------|-----------------|-----------------------------------|
| Quiz       | imageUrl  | varchar, null   | Capa do quiz (card na lista)      |
| Question   | imageUrl  | varchar, null   | Imagem exibida durante a pergunta |

### Variáveis de ambiente envolvidas

**Backend** (nunca expostas ao frontend):
- `IMAGEKIT_PRIVATE_KEY` — assina os parâmetros de upload
- `IMAGEKIT_PUBLIC_KEY` — usada só para validação interna
- `IMAGEKIT_URL_ENDPOINT` — base URL do ImageKit

**Frontend** (públicas, no bundle):
- `VITE_IMAGEKIT_PUBLIC_KEY` — enviada no FormData de upload
- `VITE_IMAGEKIT_URL_ENDPOINT` — base URL para POST de upload

## Arquitetura alvo (pendente)

### `services/imagekit.ts` — função centralizada

Extrair `uploadToImageKit` para um módulo reutilizável, eliminando duplicação.
Pode adicionar validação de tipo/tamanho antes do upload e reportar progresso.

### `ImageUploadField.tsx` — componente reutilizável

- Preview da imagem atual
- Input file com accept restrito
- Barra de progresso durante upload
- Botão de remover imagem
- Integrável via RHF `Controller` quando RHF for adotado

### Validação client-side

Antes de iniciar o upload:
- Tipo: `image/jpeg`, `image/png`, `image/webp`
- Tamanho: ≤ 5 MB
- Feedback imediato se inválido (toast/mensagem inline)

## Critérios de aceite

- ✅ Upload nunca passa pelo backend (só a assinatura)
- ✅ `GET /imagekit/auth` exige JWT
- ✅ Funciona end-to-end em produção
- ❌ Sem validação de tipo/tamanho antes do upload
- ❌ Sem barra de progresso
- ❌ Código duplicado em dois arquivos
- ❌ Sem botão de remover imagem
