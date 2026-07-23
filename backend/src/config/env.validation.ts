import { z } from 'zod';

/**
 * Schema Zod para variáveis de ambiente obrigatórias.
 * Valida no boot — se falhar, a aplicação não sobe.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET deve ter pelo menos 8 caracteres'),
  PORT: z.coerce.number().optional().default(3000),
  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
  ENABLE_SWAGGER: z.string().optional(),
  NODE_ENV: z.string().optional().default('development'),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Função de validação compatível com ConfigModule.forRoot({ validate }).
 * Lança erro descritivo e trava o boot se alguma variável obrigatória
 * estiver ausente ou inválida.
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `\n❌ Variáveis de ambiente inválidas:\n${formatted}\n\nConfira seu .env e tente novamente.\n`,
    );
  }
  return result.data;
}
