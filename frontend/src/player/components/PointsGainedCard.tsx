import { cn } from '../../lib/utils';

interface PointsGainedCardProps {
  /** Pontos ganhos nesta rodada (0 se errou). O total acumulado NÃO
   *  aparece aqui — ele continua exibido no rodapé. */
  pointsGained: number;
  correct: boolean;
  className?: string;
}

export function PointsGainedCard({ pointsGained, className }: PointsGainedCardProps) {
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
    </div>
  );
}