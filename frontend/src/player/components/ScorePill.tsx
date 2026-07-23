import { cn } from '../../lib/utils';

interface ScorePillProps {
  score: number;
  className?: string;
}

export function ScorePill({ score, className }: ScorePillProps) {
  return (
    <span
      className={cn(
        'font-mono font-bold text-lg text-brand tabular-nums',
        className,
      )}
    >
      {score.toLocaleString()} pontos
    </span>
  );
}