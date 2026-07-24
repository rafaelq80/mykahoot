import { z } from 'zod';

export const turmaSchema = z.object({
  nome: z.string().min(1, 'Informe o nome da turma').max(80, 'Máximo 80 caracteres'),
});

export type TurmaFormData = z.infer<typeof turmaSchema>;
