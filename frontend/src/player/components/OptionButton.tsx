import { cn } from '../../lib/utils';

export type OptionVariant = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';

const ICONS = ['▲', '◆', '●', '■'] as const;
const BG_CLASSES = [
  'bg-option-a',
  'bg-option-b',
  'bg-option-c',
  'bg-option-d',
] as const;

interface OptionButtonProps {
  index: 0 | 1 | 2 | 3;
  text: string;
  variant?: OptionVariant;
  disabled?: boolean;
  onClick?: () => void;
}

export function OptionButton({
  index,
  text,
  variant = 'idle',
  disabled = false,
  onClick,
}: OptionButtonProps) {
  const isCorrect = variant === 'correct';
  const isWrong = variant === 'wrong';

  return (
    <button
      type="button"
      className={cn(
        // Base layout — um pouco maior que o original, sem dominar o espaço vertical
        'flex min-h-18 w-full items-center gap-3 rounded-xl px-5 py-3.5 sm:min-h-21 sm:gap-4 sm:px-6',
        'text-left font-bold text-base text-white sm:text-lg',
        // Ocupa melhor o espaço horizontal e comporta textos de até 2 linhas
        'whitespace-normal break-words',
        'transition-all active:scale-95 motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
        // Color per option
        BG_CLASSES[index],
        // State modifiers
        variant === 'idle' && 'hover:opacity-90',
        variant === 'dimmed' && 'opacity-40 cursor-not-allowed',
        variant === 'selected' && 'ring-4 ring-white ring-offset-2',
        isCorrect && 'ring-4 ring-white ring-offset-2',
        isWrong && 'ring-4 ring-white ring-offset-2 animate-[shake_0.4s_ease] motion-reduce:animate-none',
        disabled && 'cursor-not-allowed',
      )}
      disabled={disabled}
      aria-pressed={variant === 'selected' || isCorrect}
      aria-disabled={disabled}
      onClick={onClick}
    >
      <span className="text-2xl shrink-0 leading-none sm:text-3xl" aria-hidden="true">
        {isCorrect ? '✓' : ICONS[index]}
      </span>
      <span className="line-clamp-2 min-w-0 flex-1 leading-snug">{text}</span>
    </button>
  );
}