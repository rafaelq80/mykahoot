import { useGameStore } from '../store/useGameStore';
import { QuestionView } from '../components/QuestionView';
import { ProgressBar } from '../components/ProgressBar';
import { TimerDisplay } from '../components/TimerDisplay';
import { useCountdown } from '../../shared/hooks/useCountdown';
import { AvatarBadge } from '../components/AvatarBadge';
import { ScorePill } from '../components/ScorePill';
import { TopNavBar } from '../components/TopNavBar';

export default function QuestionPage() {
  useCountdown();

  const playerInfo = useGameStore((s) => s.playerInfo);
  const timer = useGameStore((s) => s.timer);
  const questionNumber = useGameStore((s) => s.questionNumber);
  const totalQuestions = useGameStore((s) => s.totalQuestions);
  const currentScore = useGameStore((s) => s.currentScore);
  const currentPosition = useGameStore((s) => s.currentPosition);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
      {/* Top bar: marca + contador de pergunta + timer */}
      <TopNavBar
        className="border-b-0 pt-3 pb-0"
        leftSlot={
          <span className="rounded-full bg-quiz-surface-strong px-3 py-1 text-label-xs font-bold uppercase tracking-[0.14em] text-white/90">
            Pergunta {questionNumber}/{totalQuestions}
          </span>
        }
        rightSlot={<TimerDisplay seconds={timer} />}
      />

      {/* Barra de progresso fina */}
      <div className="px-4 pt-2 sm:px-6">
        <ProgressBar current={questionNumber} total={totalQuestions} />
      </div>

      {/* Conteúdo da pergunta — centralizado, ocupa o espaço disponível */}
      <main className="flex flex-1 min-h-0 flex-col items-center justify-center overflow-hidden px-4 py-3">
        <QuestionView />
      </main>

      {/* Rodapé: jogador + pontuação */}
      {/* Rodapé: jogador + posição + pontuação */}
      {playerInfo && (
        <footer className="grid grid-cols-3 items-center border-t border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6 w-full">
          {/* Lado Esquerdo: Jogador */}
          <div className="flex flex-col items-start">
            <AvatarBadge avatar={playerInfo.avatar} nickname={playerInfo.nickname} />
          </div>

          {/* Centro: Posição no Ranking */}
          <div className="flex flex-col items-center text-center">
            {currentPosition != null ? (
              <span className="text-title-sm font-black text-white bg-quiz-surface-strong px-4 py-1 rounded-full border border-quiz-border shadow-sm">
                {`${formatOrdinal(currentPosition)} lugar`}
              </span>
            ) : (
              <span className="text-body-md font-bold text-white/50">-</span>
            )}
          </div>

          {/* Lado Direito: Pontuação Total */}
          <div className="flex flex-col items-end text-right">
            <span className="rounded-full bg-quiz-highlight px-3 py-1 font-extrabold text-quiz-highlight-foreground shadow-sm">
              <ScorePill score={currentScore} />
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}

function formatOrdinal(position: number): string {
  return `${position}º`;
}