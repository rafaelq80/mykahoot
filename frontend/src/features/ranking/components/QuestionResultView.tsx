import { useGameStore } from '../../../stores/useGameStore';
import { cn } from '../../../lib/utils';

export function QuestionResultView() {
  const questionResult = useGameStore((s) => s.questionResult);
  const question = useGameStore((s) => s.question);

  if (!questionResult || !question) return null;

  const { you } = questionResult;
  const correct = you.correct;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 text-center animate-[slideUp_0.4s_ease_both]">
      {/* Ícone — anéis concêntricos */}
      <div
        className={cn(
          'flex h-37.5 w-37.5 items-center justify-center rounded-full sm:h-45 sm:w-45',
          correct ? 'bg-option-d/25' : 'bg-option-a/25',
        )}
      >
        <div
          className={cn(
            'flex h-30 w-30 items-center justify-center rounded-full shadow-lg sm:h-36.25 sm:w-36.25',
            correct ? 'bg-option-d' : 'bg-option-a',
          )}
        >
          {correct ? <CheckIcon /> : <CrossIcon />}
        </div>
      </div>

      {/* Título + mensagem de incentivo */}
      <div className="flex flex-col gap-1">
        <p className="font-serif font-black text-4xl text-white sm:text-5xl">
          {correct ? 'CORRECT!' : 'WRONG!'}
        </p>
        {correct && (
          <p className="font-serif font-bold text-lg text-option-d">
            You&apos;re on fire!
          </p>
        )}
      </div>

      {/* Cartão de pontos */}
      <div
        className={cn(
          'flex items-baseline gap-1.5 rounded-xl border-2 bg-quiz-surface px-8 py-4',
          correct ? 'border-option-d' : 'border-option-a',
        )}
      >
        <span className="font-serif font-black text-4xl text-white">
          {correct ? `+${you.score.toLocaleString()}` : '+0'}
        </span>
        <span className="font-serif text-sm text-white/70">pts</span>
      </div>

      {/* Aguardando próxima pergunta */}
      <div className="flex items-center gap-2 text-white/50">
        <SpinnerIcon />
        <span className="text-sm">Wait for next question...</span>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
      aria-hidden="true"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
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