import { useGameStore } from '../store/useGameStore';
import { cn } from '../../lib/utils';
import { PointsGainedCard } from './PointsGainedCard';
import { PositionCard } from './PositionCard';

export function QuestionResultView() {
  const questionResult = useGameStore((s) => s.questionResult);
  const question = useGameStore((s) => s.question);
  const lastPointsGained = useGameStore((s) => s.lastPointsGained);
  const lastPositionChange = useGameStore((s) => s.lastPositionChange);

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
          {correct ? 'ACERTOU!' : 'ERROU!'}
        </p>
      </div>

      {/* Retângulos: pontos ganhos nesta rodada + posição no ranking
          (com medalha pro top 3) — mesmo layout pro acerto e pro erro.
          O total acumulado NÃO aparece aqui, fica só no rodapé. */}
      <div className="flex w-full gap-3">
        <PointsGainedCard pointsGained={correct ? lastPointsGained : 0} correct={correct} />
        <PositionCard position={you.position} positionChange={lastPositionChange} />
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