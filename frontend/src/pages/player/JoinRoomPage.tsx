import { useEffect, useState } from 'react';
import { JoinRoomForm } from '../../features/player-session/components/JoinRoomForm';
import { useGameStore } from '../../stores/useGameStore';
import { getSocket } from '../../hooks/useSocket';

export default function JoinRoomPage() {
  const setPlayerInfo = useGameStore((s) => s.setPlayerInfo);
  const setJoinPending = useGameStore((s) => s.setJoinPending);
  const playerCount = useGameStore((s) => s.playerCount);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const joinPending = useGameStore((s) => s.joinPending);
  const errorMessage = useGameStore((s) => s.errorMessage);
  const [connected, setConnected] = useState(getSocket().connected);

  useEffect(() => {
    const socket = getSocket();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setConnected(socket.connected);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const roomOpen = gameStatus === 'lobby';

  const handleJoin = (nickname: string, avatar: string) => {
    if (!roomOpen) return;
    setPlayerInfo({ nickname, avatar });
    setJoinPending(true);
    getSocket().emit('player:entrar', { nickname, avatar });
  };

  return (
    <JoinRoomForm
      onJoin={handleJoin}
      roomOpen={roomOpen}
      joinPending={joinPending}
      connected={connected}
      playerCount={playerCount}
      errorMessage={errorMessage}
    />
  );
}
