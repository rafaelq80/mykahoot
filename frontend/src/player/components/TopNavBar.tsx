import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'QuizMaster Live';

interface TopNavBarProps {
  className?: string;
  /** Content rendered next to the app name on the left (e.g. question counter pill). */
  leftSlot?: ReactNode;
  /** Content rendered to the right of the app name (e.g. timer). */
  rightSlot?: ReactNode;
  onSettingsClick?: () => void;
}

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[22px] w-[22px]"
      aria-hidden="true"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function TopNavBar({ className, leftSlot, rightSlot, onSettingsClick }: TopNavBarProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between border-b border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="font-extrabold text-lg sm:text-xl text-white">{APP_NAME}</span>
        {leftSlot}
      </div>

      <div className="flex items-center gap-2">
        {rightSlot}
        {onSettingsClick && (
          <button
            type="button"
            aria-label="Configurações"
            onClick={onSettingsClick}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-white',
              'transition-colors hover:bg-white/10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
            )}
          >
            <SettingsIcon />
          </button>
        )}
      </div>
    </header>
  );
}
