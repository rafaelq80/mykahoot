import { z } from 'zod';

export const themeSchema = z.object({
  name: z.string().min(1, 'Informe o nome do tema').max(80, 'Máximo 80 caracteres'),
  description: z.string().optional(),
});

export type ThemeFormData = z.infer<typeof themeSchema>;
