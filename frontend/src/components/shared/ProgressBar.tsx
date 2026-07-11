interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="h-1 w-full bg-surface-container" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      <div
        className="h-full bg-brand transition-[width] duration-400 ease-in-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
