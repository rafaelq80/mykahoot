import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url =
      import.meta.env.VITE_SOCKET_URL ??
      import.meta.env.VITE_API_URL ??
      'http://localhost:3000';
    socket = io(url, {
      autoConnect: false,
      // Configuração explícita de reconexão: evita depender dos defaults do
      // socket.io-client e reduz o risco de "thundering herd" quando muitos
      // clientes (ex.: 50 alunos) reconectam ao mesmo tempo após uma queda
      // breve do backend. O jitter/randomização já é aplicado internamente
      // pela lib entre reconnectionDelay e reconnectionDelayMax.
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}
