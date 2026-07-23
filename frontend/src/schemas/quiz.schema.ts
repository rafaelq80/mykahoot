import { z } from 'zod';

export const quizSchema = z.object({
  title: z.string().min(1, 'Informe o título do quiz').max(120, 'Máximo 120 caracteres'),
  themeId: z.string().min(1, 'Selecione um tema'),
});

export type QuizFormData = z.infer<typeof quizSchema>;
