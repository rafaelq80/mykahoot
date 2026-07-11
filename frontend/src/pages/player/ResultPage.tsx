import { useGameStore } from '../../stores/useGameStore';
import { QuestionResultView } from '../../features/ranking/components/QuestionResultView';
import { ProgressBar } from '../../components/shared/ProgressBar';
import { AvatarBadge } from '../../components/shared/AvatarBadge';
import { ScorePill } from '../../components/shared/ScorePill';

const APP_NAME = 'QuizMaster Live';

export default function ResultPage() {
  const playerInfo = useGameStore((s) => s.playerInfo);
  const questionNumber = useGameStore((s) => s.questionNumber);
  const totalQuestions = useGameStore((s) => s.totalQuestions);
  const currentScore = useGameStore((s) => s.currentScore);
  const currentPosition = useGameStore((s) => s.currentPosition);

  return (
    <div className="flex min-h-dvh flex-col bg-quiz-bg-to bg-quiz-gradient text-white">
      {/* Top bar — mesmo padrão do QuestionPage, timer trocado por círculo neutro */}
      <header className="flex items-center justify-between px-4 pt-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-lg sm:text-xl">{APP_NAME}</span>
          <span className="rounded-full bg-quiz-surface-strong px-3 py-1 text-label-xs font-bold uppercase tracking-[0.14em] text-white/90">
            Pergunta {questionNumber}/{totalQuestions}
          </span>
        </div>

        <div className="h-9 w-9 rounded-full bg-white/15" aria-hidden="true" />
      </header>

      {/* Barra de progresso fina */}
      <div className="px-4 pt-3 sm:px-6">
        <ProgressBar current={questionNumber} total={totalQuestions} />
      </div>

      {/* Conteúdo do resultado — centralizado */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-6">
        <QuestionResultView />
      </main>

      {/* Rodapé — mesmo padrão do QuestionPage */}
      {playerInfo && (
        <footer className="flex items-center justify-between border-t border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6">
          <div className="flex flex-col">
            <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-quiz-text-muted">
              Jogador
            </span>
            <AvatarBadge avatar={playerInfo.avatar} nickname={playerInfo.nickname} />
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-quiz-text-muted">
              Pontuação
            </span>
            <div className="flex items-center gap-2">
              {currentPosition != null && (
                <span className="text-body-md font-bold text-white/90">
                  {formatOrdinal(currentPosition)} lugar
                </span>
              )}
              <span className="rounded-full bg-quiz-highlight px-3 py-1 font-extrabold text-quiz-highlight-foreground shadow-sm">
                <ScorePill score={currentScore} />
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function formatOrdinal(position: number): string {
  return `${position}º`;
}