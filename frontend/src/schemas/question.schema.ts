import { z } from 'zod';

export const questionSchema = z.object({
  text: z.string().min(1, 'Informe o texto da pergunta'),
  options: z.tuple([
    z.string().min(1, 'Alternativa 1 obrigatória'),
    z.string().min(1, 'Alternativa 2 obrigatória'),
    z.string().min(1, 'Alternativa 3 obrigatória'),
    z.string().min(1, 'Alternativa 4 obrigatória'),
  ]),
  correctIndex: z.number().int().min(0).max(3),
  timeLimitSec: z.number().int().min(5, 'Mínimo 5 segundos').max(120, 'Máximo 120 segundos'),
  order: z.number().int().min(1),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

export type QuestionFormData = z.infer<typeof questionSchema>;
