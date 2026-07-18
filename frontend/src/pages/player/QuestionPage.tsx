import { useGameStore } from '../../stores/useGameStore';
import { QuestionView } from '../../features/question-flow/components/QuestionView';
import { ProgressBar } from '../../components/shared/ProgressBar';
import { useCountdown } from '../../hooks/useCountdown';
import { AvatarBadge } from '../../components/shared/AvatarBadge';
import { ScorePill } from '../../components/shared/ScorePill';

const APP_NAME = 'QuizMaster Live';

export default function QuestionPage() {
  useCountdown();

  const playerInfo = useGameStore((s) => s.playerInfo);
  const timer = useGameStore((s) => s.timer);
  const questionNumber = useGameStore((s) => s.questionNumber);
  const totalQuestions = useGameStore((s) => s.totalQuestions);
  const currentScore = useGameStore((s) => s.currentScore);
  const currentPosition = useGameStore((s) => s.currentPosition);

  // Últimos 5s: pisca em vermelho pra chamar atenção que o tempo tá acabando
  const isTimeRunningOut = timer > 0 && timer <= 5;

  return (
    <div className="flex min-h-dvh flex-col bg-quiz-bg-to bg-quiz-gradient text-white">
      {/* Top bar: marca + contador de pergunta + timer */}
      <header className="flex items-center justify-between px-4 pt-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-lg sm:text-xl">{APP_NAME}</span>
          <span className="rounded-full bg-quiz-surface-strong px-3 py-1 text-label-xs font-bold uppercase tracking-[0.14em] text-white/90">
            Pergunta {questionNumber}/{totalQuestions}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-extrabold text-quiz-highlight-foreground shadow-sm ${
            isTimeRunningOut ? 'animate-timer-warning' : 'bg-quiz-highlight'
          }`}
        >
          <ClockIcon />
          <span>{timer}s</span>
        </div>
      </header>

      {/* Barra de progresso fina */}
      <div className="px-4 pt-3 sm:px-6">
        <ProgressBar current={questionNumber} total={totalQuestions} />
      </div>

      {/* Conteúdo da pergunta — centralizado */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-6">
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
                {formatOrdinal(currentPosition)}
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

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}