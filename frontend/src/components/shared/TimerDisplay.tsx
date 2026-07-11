import { cn } from '../../lib/utils';

interface TimerDisplayProps {
  seconds: number;
  /** Use 'light' when timer sits on a dark (brand) background */
  colorScheme?: 'light' | 'dark';
}

export function TimerDisplay({ seconds, colorScheme = 'light' }: TimerDisplayProps) {
  const isUrgent = seconds > 0 && seconds <= 5;

  return (
    <div
      className={cn(
        'flex w-20 h-20 items-center justify-center rounded-full border-4',
        'font-black text-4xl tabular-nums transition-colors duration-300',
        isUrgent
          ? 'border-option-a text-option-a animate-pulse motion-reduce:animate-none'
          : colorScheme === 'dark'
          ? 'border-white text-white'
          : 'border-brand text-brand',
      )}
      aria-live="polite"
      aria-label={`${seconds} segundos restantes`}
    >
      {seconds}
    </div>
  );
}
