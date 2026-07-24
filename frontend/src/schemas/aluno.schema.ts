import { z } from 'zod';

export const alunoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome do aluno').max(80, 'Máximo 80 caracteres'),
});

export type AlunoFormData = z.infer<typeof alunoSchema>;
