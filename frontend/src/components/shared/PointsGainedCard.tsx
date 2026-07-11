import { cn } from '../../lib/utils';

interface PointsGainedCardProps {
  /** Pontos ganhos nesta rodada (0 se errou). O total acumulado NÃO
   *  aparece aqui — ele continua exibido no rodapé. */
  pointsGained: number;
  correct: boolean;
  className?: string;
}

export function PointsGainedCard({ pointsGained, correct, className }: PointsGainedCardProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-1.5 rounded-2xl border border-quiz-card-border bg-quiz-card px-4 py-3 shadow-sm sm:px-5 sm:py-4',
        className,
      )}
    >
      <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-quiz-card-muted">
        Pontos
      </span>
      <span className="font-serif font-black text-3xl text-white tabular-nums sm:text-4xl">
        +{pointsGained.toLocaleString()}
      </span>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-quiz-card-muted">
        <StarIcon />
        {correct ? 'Resposta certa' : 'Sem pontos dessa vez'}
      </span>
    </div>
  );
}

function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.25" />
      <path d="M12 7.3l1.28 2.66 2.86.42-2.07 2.05.49 2.87L12 13.85l-2.56 1.45.49-2.87-2.07-2.05 2.86-.42z" />
    </svg>
  );
}