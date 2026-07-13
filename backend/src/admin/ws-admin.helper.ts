import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';

interface AdminJwtPayload {
  sub: string;
  username: string;
  role: string;
}

export async function verifyAdminSocket(
  client: Socket,
  token: string | undefined,
  jwtService: JwtService,
): Promise<boolean> {
  if (!token) {
    client.emit('game:erro', { message: 'Não autorizado.' });
    return false;
  }

  try {
    const payload = await jwtService.verifyAsync<AdminJwtPayload>(token);
    if (payload.role !== 'admin') {
      throw new Error('invalid role');
    }
    client.data.isAdmin = true;
    return true;
  } catch {
    client.emit('game:erro', { message: 'Token inválido ou expirado.' });
    return false;
  }
}

export function requireAdminSocket(client: Socket): boolean {
  if (!client.data.isAdmin) {
    client.emit('game:erro', { message: 'Não autorizado.' });
    return false;
  }
  return true;
}
