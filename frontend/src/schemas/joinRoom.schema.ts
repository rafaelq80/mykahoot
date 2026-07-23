import { z } from 'zod';

export const joinRoomSchema = z.object({
  nickname: z.string().min(1, 'Informe seu nome').max(20, 'Máximo 20 caracteres'),
});

export type JoinRoomFormData = z.infer<typeof joinRoomSchema>;
