import { usePlayerSocket } from '../features/player-session/hooks/usePlayerSocket';
import { useBackgroundMusic } from '../features/background-music/hooks/useBackgroundMusic';
import type { MusicPhase } from '../features/background-music/constants';
import type { GameScreen } from '../stores/useGameStore';
import { useGameStore } from '../stores/useGameStore';
import JoinRoomPage from './player/JoinRoomPage';
import LobbyPage from './player/LobbyPage';
import QuestionPage from './player/QuestionPage';
import ResultPage from './player/ResultPage';
import PodiumPage from './player/PodiumPage';

function musicPhaseForScreen(screen: GameScreen): MusicPhase {
  switch (screen) {
    case 'lobby':
      return 'lobby';
    case 'question':
      return 'question';
    case 'question_result':
      return 'result';
    case 'final_ranking':
      return 'podium';
    default:
      return 'idle';
  }
}

export function PlayerPage() {
  usePlayerSocket();

  const screen = useGameStore((s) => s.screen);
  const errorMessage = useGameStore((s) => s.errorMessage);
  const musicEnabledByAdmin = useGameStore((s) => s.musicEnabledByAdmin);

  useBackgroundMusic(musicPhaseForScreen(screen), musicEnabledByAdmin);

  return (
    <>
      {errorMessage && screen !== 'entry' && (
        <div
          role="alert"
          className="fixed inset-x-0 top-0 z-50 bg-option-a px-4 py-2 text-center text-sm font-bold text-white shadow-md"
        >
          {errorMessage}
        </div>
      )}

      {screen === 'connecting' && (
        <div className="flex min-h-dvh items-center justify-center bg-surface">
          <p className="animate-pulse font-bold text-2xl text-brand motion-reduce:animate-none">
            Conectando...
          </p>
        </div>
      )}
      {screen === 'entry' && <JoinRoomPage />}
      {screen === 'lobby' && <LobbyPage />}
      {screen === 'question' && <QuestionPage />}
      {screen === 'question_result' && <ResultPage />}
      {screen === 'final_ranking' && <PodiumPage />}
    </>
  );
}
