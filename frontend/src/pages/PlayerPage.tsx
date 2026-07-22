import { usePlayerSocket } from '../features/player-session/hooks/usePlayerSocket';
import { useGameStore } from '../stores/useGameStore';
import JoinRoomPage from './player/JoinRoomPage';
import LobbyPage from './player/LobbyPage';
import QuestionPage from './player/QuestionPage';
import ResultPage from './player/ResultPage';
import PodiumPage from './player/PodiumPage';

/**
 * Player entry point — mounts the socket bridge and renders the
 * appropriate sub-page based on game store state.
 *
 * NOTE: Background music does NOT play here. Music plays only on the
 * professor's device (AdminPage). The sting (correct/wrong) still plays
 * on the student's device via ResultPage → playSting.
 */
export function PlayerPage() {
  usePlayerSocket();

  const screen = useGameStore((s) => s.screen);
  const errorMessage = useGameStore((s) => s.errorMessage);

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
