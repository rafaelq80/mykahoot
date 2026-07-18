import { useEffect, useState } from 'react';
import { JoinRoomForm } from '../../features/player-session/components/JoinRoomForm';
import { AvatarSelectPage } from './AvatarSelectPage';
import { useGameStore } from '../../stores/useGameStore';
import { getSocket } from '../../hooks/useSocket';

type Step = 'form' | 'avatar';

interface SelectedAluno {
  alunoId: string;
  nickname: string;
  turmaId: string;
}

export default function JoinRoomPage() {
  const setPlayerInfo = useGameStore((s) => s.setPlayerInfo);
  const setJoinPending = useGameStore((s) => s.setJoinPending);
  const playerCount = useGameStore((s) => s.playerCount);
  const gameStatus = useGameStore((s) => s.gameStatus);
  const joinPending = useGameStore((s) => s.joinPending);
  const errorMessage = useGameStore((s) => s.errorMessage);
  const [connected, setConnected] = useState(getSocket().connected);
  const [step, setStep] = useState<Step>('form');
  const [selected, setSelected] = useState<SelectedAluno | null>(null);

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

  const handleContinue = (alunoId: string, nickname: string, turmaId: string) => {
    setSelected({ alunoId, nickname, turmaId });
    setStep('avatar');
  };

  const handleBack = () => {
    setStep('form');
  };

  const handleJoin = (avatar: string) => {
    if (!roomOpen || !selected) return;
    setPlayerInfo({ nickname: selected.nickname, avatar });
    setJoinPending(true);
    getSocket().emit('player:entrar', {
      alunoId: selected.alunoId,
      avatar,
      turmaId: selected.turmaId,
    });
  };

  if (step === 'avatar' && selected) {
    return (
      <AvatarSelectPage
        nickname={selected.nickname}
        onConfirm={handleJoin}
        onBack={handleBack}
        roomOpen={roomOpen}
        joinPending={joinPending}
        playerCount={playerCount}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <JoinRoomForm
      onContinue={handleContinue}
      roomOpen={roomOpen}
      connected={connected}
      playerCount={playerCount}
      errorMessage={errorMessage}
    />
  );
}