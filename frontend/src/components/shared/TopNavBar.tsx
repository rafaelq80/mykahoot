import { cn } from '../../lib/utils';

interface TopNavBarProps {
  className?: string;
  onVolumeClick?: () => void;
  onSettingsClick?: () => void;
}

function VolumeIcon() {
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
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
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

export function TopNavBar({ className, onVolumeClick, onSettingsClick }: TopNavBarProps) {
  const iconBtnClass = cn(
    'flex h-9 w-9 items-center justify-center rounded-lg text-white',
    'transition-colors hover:bg-white/10',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
  );

  return (
    <header
      className={cn(
        // Header roxo (players) — transparente sobre o fundo bg-brand da tela,
        // com uma linha sutil pra separar do conteúdo abaixo.
        'flex items-center justify-between border-b border-white/10 bg-transparent px-8 py-4',
        className,
      )}
    >
      <span className="font-black text-xl tracking-tight text-white">QuizMaster Live</span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Volume"
          onClick={onVolumeClick}
          className={iconBtnClass}
        >
          <VolumeIcon />
        </button>
        <button
          type="button"
          aria-label="Configurações"
          onClick={onSettingsClick}
          className={iconBtnClass}
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
}
