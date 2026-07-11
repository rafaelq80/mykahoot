import { cn } from '../../lib/utils';

interface AvatarBadgeProps {
  avatar: string;
  nickname: string;
  className?: string;
}

export function AvatarBadge({ avatar, nickname, className }: AvatarBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-xl"
        aria-hidden="true"
      >
        {avatar}
      </span>
      <span className="font-bold text-base">{nickname}</span>
    </div>
  );
}
