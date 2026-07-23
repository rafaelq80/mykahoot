import { cn } from '../../lib/utils';

interface TimerDisplayProps {
  seconds: number;
  /** Unused in pill variant — kept for API compatibility. */
  colorScheme?: 'light' | 'dark';
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

export function TimerDisplay({ seconds }: TimerDisplayProps) {
  const isUrgent = seconds > 0 && seconds <= 5;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-1.5 font-extrabold text-quiz-highlight-foreground shadow-sm',
        isUrgent ? 'animate-timer-warning' : 'bg-quiz-highlight',
      )}
      aria-live="polite"
      aria-label={`${seconds} segundos restantes`}
    >
      <ClockIcon />
      <span>{seconds}s</span>
    </div>
  );
}
