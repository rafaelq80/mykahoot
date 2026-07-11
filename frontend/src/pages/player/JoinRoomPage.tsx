import { JoinRoomForm } from '../../features/player-session/components/JoinRoomForm';
import { useGameStore } from '../../stores/useGameStore';
import { getSocket } from '../../hooks/useSocket';

export default function JoinRoomPage() {
  const setPlayerInfo = useGameStore((s) => s.setPlayerInfo);
  const setScreen = useGameStore((s) => s.setScreen);
  const playerCount = useGameStore((s) => s.playerCount);

  const handleJoin = (nickname: string, avatar: string) => {
    setPlayerInfo({ nickname, avatar });
    getSocket().emit('player:entrar', { nickname, avatar });
    setScreen('lobby');
  };

  return <JoinRoomForm onJoin={handleJoin} playerCount={playerCount} />;
}
