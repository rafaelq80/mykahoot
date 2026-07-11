import { useEffect, useRef } from 'react';
import { getSocket } from '../../../hooks/useSocket';
import { useAdminStore } from '../../../stores/useAdminStore';
import type {
  AdminEstadoEvent,
  AdminPlacarEvent,
  AdminFimEvent,
} from '../../../types/events';

export function useAdminSocket(token: string | null) {
  const handleEstado = useAdminStore((s) => s.handleEstado);
  const handlePlacar = useAdminStore((s) => s.handlePlacar);
  const handleFim = useAdminStore((s) => s.handleFim);
  const setErrorMessage = useAdminStore((s) => s.setErrorMessage);
  const setTimer = useAdminStore((s) => s.setTimer);
  const screen = useAdminStore((s) => s.screen);
  const timer = useAdminStore((s) => s.timer);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown tick for question screen
  useEffect(() => {
    if (screen !== 'question_active' || timer <= 0) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      const t = useAdminStore.getState().timer;
      if (t <= 1) { clearInterval(timerRef.current!); timerRef.current = null; setTimer(0); }
      else setTimer(t - 1);
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [screen, timer, setTimer]);

  // Socket listeners
  useEffect(() => {
    if (!token) return;
    const socket = getSocket();

    const onEstado = (data: AdminEstadoEvent) => handleEstado(data);
    const onPlacar = (data: AdminPlacarEvent) => handlePlacar(data);
    const onFim = (data: AdminFimEvent) => handleFim(data);
    const onErro = (data: { message: string }) => setErrorMessage(data.message);

    // Join admin room as soon as socket connects
    const onConnect = () => socket.emit('admin:conectar');

    socket.on('connect', onConnect);
    socket.on('admin:estado', onEstado);
    socket.on('admin:placar', onPlacar);
    socket.on('admin:fim', onFim);
    socket.on('game:erro', onErro);

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit('admin:conectar');
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('admin:estado', onEstado);
      socket.off('admin:placar', onPlacar);
      socket.off('admin:fim', onFim);
      socket.off('game:erro', onErro);
    };
  }, [token, handleEstado, handlePlacar, handleFim, setErrorMessage]);

  const selecionarQuiz = (quizId: string) => getSocket().emit('admin:selecionarTema', { quizId });
  const liberarPergunta = (timeLimitSec: number) => {
    getSocket().emit('admin:liberarPergunta');
    setTimer(timeLimitSec);
  };
  const proximaPergunta = () => getSocket().emit('admin:proximaPergunta');
  const encerrarSala = () => getSocket().emit('admin:encerrarSala');

  return { selecionarQuiz, liberarPergunta, proximaPergunta, encerrarSala };
}