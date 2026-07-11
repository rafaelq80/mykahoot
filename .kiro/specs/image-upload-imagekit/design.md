# Design — Upload de Imagem de Pergunta via ImageKit

## Backend (já existente, sem mudança estrutural)

`GET /imagekit/auth` → `{ signature, expire, token }`, usando `IMAGEKIT_PRIVATE_KEY`
do `.env`. Único ajuste desta spec: garantir que o endpoint exija o JWT do professor
(`@UseGuards(JwtGuard)`) para não permitir upload anônimo — conferir se já está
protegido e, se não estiver, adicionar.

## Frontend

### `services/imagekit.ts`

```ts
export async function uploadQuestionImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const authRes = await api.get('/imagekit/auth')
  const { signature, expire, token } = authRes.data

  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileName', file.name)
  formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY)
  formData.append('signature', signature)
  formData.append('expire', expire)
  formData.append('token', token)
  formData.append('folder', '/mykahoot/questions')

  const res = await axios.post(
    'https://upload.imagekit.io/api/v1/files/upload',
    formData,
    { onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / (e.total ?? 1)) * 100)) },
  )
  return res.data.url as string
}
```

### `schemas/question.schema.ts` — validação de arquivo (client-side, antes do upload)

```ts
export const imageFileSchema = z
  .instanceof(File)
  .refine((f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type), 'Formato inválido')
  .refine((f) => f.size <= 5 * 1024 * 1024, 'Máximo 5MB')
```

Este schema valida o `File` **antes** de chamar `uploadQuestionImage` — não faz parte
do `questionSchema` principal (que valida o formulário final, cujo campo é
`imageUrl: string`, não o arquivo).

### `features/quiz-editor/components/ImageUploadField.tsx`

Componente controlado fora do RHF (arquivo não é um valor de formulário sério até
virar URL):

```tsx
function ImageUploadField({ value, onChange }: { value?: string; onChange: (url?: string) => void }) {
  const [progress, setProgress] = useState<number | null>(null)

  async function handleFileSelect(file: File) {
    const parsed = imageFileSchema.safeParse(file)
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return }
    setProgress(0)
    try {
      const url = await uploadQuestionImage(file, setProgress)
      onChange(url)
    } catch {
      toast.error('Falha ao enviar imagem. Tente novamente.')
    } finally {
      setProgress(null)
    }
  }

  return (
    <div>
      {value && <img src={value} className="rounded-lg" /* preview */ />}
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} disabled={progress !== null} />
      {progress !== null && <Progress value={progress} />}
      {value && <Button variant="ghost" onClick={() => onChange(undefined)}>Remover imagem</Button>}
    </div>
  )
}
```

`QuestionForm` usa `<Controller name="imageUrl" control={form.control} render={({ field }) => <ImageUploadField value={field.value} onChange={field.onChange} />} />` para integrar ao RHF sem forçar o `File` a passar pelo schema principal.

## Critérios de aceite

- Upload nunca passa pelo backend do MyKahoot (só a assinatura passa).
- Arquivo > 5MB ou de tipo inválido é rejeitado antes de qualquer chamada de rede de
  upload.
- `GET /imagekit/auth` exige autenticação de professor.
- Submeter o formulário com upload em andamento é bloqueado (botão desabilitado).
