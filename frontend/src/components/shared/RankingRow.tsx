import { cn } from '../../lib/utils';

const MEDALS = ['🥇', '🥈', '🥉'] as const;

interface RankingRowProps {
  position: number;
  avatar: string;
  nickname: string;
  score: number;
  isSelf?: boolean;
  animationDelay?: string;
}

export function RankingRow({
  position,
  avatar,
  nickname,
  score,
  isSelf = false,
  animationDelay,
}: RankingRowProps) {
  const medal = position <= 3 ? MEDALS[position - 1] : null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-3 py-2',
        'animate-[slideUp_0.3s_ease_both] motion-reduce:animate-none',
        isSelf
          ? 'border-brand bg-surface-container border-l-4'
          : 'border-surface-container bg-surface',
      )}
      style={animationDelay ? { animationDelay } : undefined}
      aria-current={isSelf ? 'true' : undefined}
    >
      <span className="w-7 text-center font-mono text-sm text-gray-500" aria-hidden="true">
        {medal ?? position}
      </span>
      <span className="text-xl" aria-hidden="true">{avatar}</span>
      <span className="flex-1 truncate font-semibold text-sm">
        {nickname}
        {isSelf && <span className="ml-1 text-brand text-xs">(você)</span>}
      </span>
      <span className="font-mono text-sm font-bold text-brand tabular-nums">
        {score.toLocaleString()} pts
      </span>
    </div>
  );
}
