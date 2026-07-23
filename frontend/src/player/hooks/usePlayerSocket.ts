import { useEffect } from 'react';
import { getSocket } from '../../shared/hooks/useSocket';
import { useGameStore } from '../store/useGameStore';
import type {
  GameEstadoEvent,
  GamePerguntaEvent,
  GameResultadoPerguntaEvent,
  GameFimEvent,
} from '../../types/events';

/**
 * Registers all socket event listeners for the player flow and wires
 * them to the game store. Mount once at the player app entry point.
 *
 * Also handles auto-rejoin: when the room transitions to 'lobby' and
 * lastJoinInfo exists in sessionStorage, automatically emits player:entrar
 * without requiring user interaction.
 */
export function usePlayerSocket() {
  const setScreen = useGameStore((s) => s.setScreen);
  const setErrorMessage = useGameStore((s) => s.setErrorMessage);
  const setPlayerInfo = useGameStore((s) => s.setPlayerInfo);
  const setJoinPending = useGameStore((s) => s.setJoinPending);
  const handleEstado = useGameStore((s) => s.handleEstado);
  const handlePergunta = useGameStore((s) => s.handlePergunta);
  const handleResultado = useGameStore((s) => s.handleResultado);
  const handleFim = useGameStore((s) => s.handleFim);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setScreen('entry');
      setErrorMessage(null);
    };

    const onDisconnect = () => {
      setScreen('connecting');
      setErrorMessage('Conexão perdida. Reconectando...');
    };

    const onGameEstado = (data: GameEstadoEvent) => {
      handleEstado(data);
    };

    const onGamePergunta = (data: GamePerguntaEvent) => handlePergunta(data);
    const onGameResultado = (data: GameResultadoPerguntaEvent) => handleResultado(data);
    const onGameFim = (data: GameFimEvent) => handleFim(data);

    const onGameErro = (data: { message: string }) => {
      const state = useGameStore.getState();
      if (state.joinPending) {
        setPlayerInfo(null);
        setJoinPending(false);
        setScreen('entry');
      }
      setErrorMessage(data.message);
    };

    const onMusica = (data: { enabled: boolean }) =>
      useGameStore.getState().setMusicEnabledByAdmin(data.enabled);

    // Professor ended the room — send everyone back to entry
    const onSalaEncerrada = () => {
      setScreen('entry');
      setErrorMessage('A sala foi encerrada pelo professor.');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('game:estado', onGameEstado);
    socket.on('game:pergunta', onGamePergunta);
    socket.on('game:resultadoPergunta', onGameResultado);
    socket.on('game:fim', onGameFim);
    socket.on('game:erro', onGameErro);
    socket.on('game:salaEncerrada', onSalaEncerrada);
    socket.on('game:musica', onMusica);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('game:estado', onGameEstado);
      socket.off('game:pergunta', onGamePergunta);
      socket.off('game:resultadoPergunta', onGameResultado);
      socket.off('game:fim', onGameFim);
      socket.off('game:erro', onGameErro);
      socket.off('game:salaEncerrada', onSalaEncerrada);
      socket.off('game:musica', onMusica);
    };
  }, [setScreen, setErrorMessage, setPlayerInfo, setJoinPending, handleEstado, handlePergunta, handleResultado, handleFim]);
}