import { cn } from '../../lib/utils';

const MEDALS = ['🥇', '🥈', '🥉'] as const;

interface PositionCardProps {
  /** Posição atual no ranking (1-based). Se null, o card não é exibido. */
  position: number | null;
  /**
   * Variação em relação à posição anterior: positivo = subiu, negativo =
   * caiu, 0 = manteve, null = ainda não há posição anterior pra comparar
   * (ex: antes da primeira pergunta ser resolvida).
   */
  positionChange: number | null;
  className?: string;
}

export function PositionCard({ position, positionChange, className }: PositionCardProps) {
  if (position == null) return null;

  const medal = position <= 3 ? MEDALS[position - 1] : null;

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-1.5 rounded-2xl border border-quiz-card-border bg-quiz-card px-4 py-3 shadow-sm sm:px-5 sm:py-4',
        className,
      )}
    >
      <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-quiz-card-muted">
        Posição
      </span>
      <span className="flex items-baseline gap-1.5 whitespace-nowrap font-serif font-black text-3xl text-white sm:text-4xl">
        {medal && (
          <span className="text-2xl sm:text-3xl" aria-hidden="true">
            {medal}
          </span>
        )}
        <span className="tabular-nums">{formatOrdinal(position)}</span>
        <span className="text-base font-bold text-white/80 sm:text-lg">lugar</span>
      </span>

      {positionChange != null && positionChange !== 0 ? (
        <span
          className={cn(
            'flex items-center gap-1.5 text-sm font-semibold',
            positionChange > 0 ? 'text-option-d' : 'text-quiz-warn',
          )}
        >
          {positionChange > 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
          {positionChange > 0 ? `+${positionChange}` : positionChange} posições
        </span>
      ) : (
        <span className="text-sm font-semibold text-quiz-card-muted">&mdash;</span>
      )}
    </div>
  );
}

function formatOrdinal(position: number): string {
  return `${position}º`;
}

function ArrowUpIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M6 18L18 6M18 6H9M18 6v9" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 18H9M18 18V9" />
    </svg>
  );
}