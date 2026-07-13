import { useEffect, useRef } from 'react';
import { getSocket } from '../../../hooks/useSocket';
import { useAdminStore } from '../../../stores/useAdminStore';
import type {
  AdminEstadoEvent,
  AdminPlacarEvent,
  AdminFimEvent,
  GameMusicaEvent,
} from '../../../types/events';

export function useAdminSocket(token: string | null) {
  const handleEstado = useAdminStore((s) => s.handleEstado);
  const handlePlacar = useAdminStore((s) => s.handlePlacar);
  const handleFim = useAdminStore((s) => s.handleFim);
  const setErrorMessage = useAdminStore((s) => s.setErrorMessage);
  const setMusicEnabledByAdmin = useAdminStore((s) => s.setMusicEnabledByAdmin);
  const setTimer = useAdminStore((s) => s.setTimer);
  const screen = useAdminStore((s) => s.screen);
  const currentQuestionIndex = useAdminStore((s) => s.currentQuestionIndex);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown local — sincronizado via admin:estado (timerRemaining do servidor)
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (screen !== 'question_active') return;

    const t = useAdminStore.getState().timer;
    if (t <= 0) return;

    timerRef.current = setInterval(() => {
      const current = useAdminStore.getState().timer;
      if (current <= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setTimer(0);
      } else {
        setTimer(current - 1);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [screen, currentQuestionIndex, setTimer]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket();

    const onEstado = (data: AdminEstadoEvent) => handleEstado(data);
    const onPlacar = (data: AdminPlacarEvent) => handlePlacar(data);
    const onFim = (data: AdminFimEvent) => handleFim(data);
    const onErro = (data: { message: string }) => setErrorMessage(data.message);
    const onMusica = (data: GameMusicaEvent) => setMusicEnabledByAdmin(data.enabled);
    const onConnect = () => socket.emit('admin:conectar', { token });

    socket.on('connect', onConnect);
    socket.on('admin:estado', onEstado);
    socket.on('admin:placar', onPlacar);
    socket.on('admin:fim', onFim);
    socket.on('game:erro', onErro);
    socket.on('game:musica', onMusica);

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit('admin:conectar', { token });
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('admin:estado', onEstado);
      socket.off('admin:placar', onPlacar);
      socket.off('admin:fim', onFim);
      socket.off('game:erro', onErro);
      socket.off('game:musica', onMusica);
    };
  }, [token, handleEstado, handlePlacar, handleFim, setErrorMessage, setMusicEnabledByAdmin]);

  const selecionarQuiz = (quizId: string) =>
    getSocket().emit('admin:selecionarTema', { quizId });

  const liberarPergunta = () => {
    getSocket().emit('admin:liberarPergunta');
  };

  const proximaPergunta = () => getSocket().emit('admin:proximaPergunta');
  const encerrarSala = () => getSocket().emit('admin:encerrarSala');

  const setMusicaGlobal = (enabled: boolean) => {
    getSocket().emit('admin:musica', { enabled });
    setMusicEnabledByAdmin(enabled);
  };

  return {
    selecionarQuiz,
    liberarPergunta,
    proximaPergunta,
    encerrarSala,
    setMusicaGlobal,
  };
}
