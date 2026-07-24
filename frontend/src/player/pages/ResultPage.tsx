import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { playSting } from '../../shared/hooks/useBackgroundMusic';
import { QuestionResultView } from '../components/QuestionResultView';
import { ProgressBar } from '../components/ProgressBar';
import { AvatarBadge } from '../../shared/components/AvatarBadge';
import { ScorePill } from '../components/ScorePill';
import { TopNavBar } from '../components/TopNavBar';

export default function ResultPage() {
  const playerInfo = useGameStore((s) => s.playerInfo);
  const questionNumber = useGameStore((s) => s.questionNumber);
  const totalQuestions = useGameStore((s) => s.totalQuestions);
  const currentScore = useGameStore((s) => s.currentScore);
  const questionResult = useGameStore((s) => s.questionResult);

  useEffect(() => {
    if (questionResult) {
      playSting(questionResult.you.correct, useGameStore.getState().musicEnabledByAdmin);
    }
  }, [questionResult]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
      {/* Top bar — mesmo padrão do QuestionPage, sem a bolinha de tempo */}
      <TopNavBar
        className="border-b-0 pt-3 pb-0"
        leftSlot={
          <span className="rounded-full bg-quiz-surface-strong px-3 py-1 text-label-xs font-bold uppercase tracking-[0.14em] text-white/90">
            Pergunta {questionNumber}/{totalQuestions}
          </span>
        }
      />

      {/* Barra de progresso fina */}
      <div className="px-4 pt-2 sm:px-6">
        <ProgressBar current={questionNumber} total={totalQuestions} />
      </div>

      {/* Conteúdo do resultado — acerto ou erro, com os cards de pontuação
          ganha e posição logo abaixo da mensagem central */}
      <main className="flex flex-1 min-h-0 flex-col items-center justify-center overflow-hidden px-4 py-3">
        <QuestionResultView />
      </main>

      {/* Rodapé — jogador à esquerda, aguardando no centro, pontuação total à direita */}
      {playerInfo && (
        <footer className="grid grid-cols-3 items-center border-t border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6">
          <div className="flex flex-col items-start">
            <AvatarBadge avatar={playerInfo.avatar} nickname={playerInfo.nickname} />
          </div>

          <div className="flex items-center justify-center gap-2 text-white/50">
            <SpinnerIcon />
            <span className="text-sm">Aguardando próxima pergunta...</span>
          </div>

          <div className="flex flex-col items-end gap-0.5">
            <span className="rounded-full bg-quiz-highlight px-3 py-1 font-extrabold text-quiz-highlight-foreground shadow-sm">
              <ScorePill score={currentScore} />
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      className="animate-spin motion-reduce:animate-none"
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}