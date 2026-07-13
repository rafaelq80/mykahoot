import { useGameStore } from '../../../stores/useGameStore';
import { PodiumDisplay } from './PodiumDisplay';

export function PodiumView() {
  const finalResult = useGameStore((s) => s.finalResult);
  const playerInfo = useGameStore((s) => s.playerInfo);
  const playerCount = useGameStore((s) => s.playerCount);

  if (!finalResult) return null;

  return (
    <PodiumDisplay
      top5={finalResult.top5}
      you={finalResult.you}
      playerInfo={playerInfo}
      playerCount={playerCount}
    />
  );
}
