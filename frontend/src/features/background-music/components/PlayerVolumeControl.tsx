import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../lib/utils';
import { useSettingsStore } from '../../../stores/useSettingsStore';

function VolumeOnIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="22" x2="16" y1="9" y2="15" />
      <line x1="16" x2="22" y1="9" y2="15" />
    </svg>
  );
}

interface PlayerVolumeControlProps {
  className?: string;
  buttonClassName?: string;
  /** Quando false, o professor desligou a música — jogador só pode aguardar */
  musicEnabledByAdmin: boolean;
}

/** Jogador controla apenas mudo local e volume — não liga música globalmente */
export function PlayerVolumeControl({
  className,
  buttonClassName,
  musicEnabledByAdmin,
}: PlayerVolumeControlProps) {
  const localMuted = useSettingsStore((s) => s.localMuted);
  const volume = useSettingsStore((s) => s.volume);
  const toggleLocalMute = useSettingsStore((s) => s.toggleLocalMute);
  const setVolume = useSettingsStore((s) => s.setVolume);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const audiblyOn = musicEnabledByAdmin && !localMuted;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-label={
          !musicEnabledByAdmin
            ? 'Música desligada pelo professor'
            : localMuted
              ? 'Ativar som local'
              : 'Silenciar localmente'
        }
        aria-pressed={audiblyOn}
        disabled={!musicEnabledByAdmin}
        onClick={() => {
          if (!musicEnabledByAdmin) return;
          toggleLocalMute();
          setOpen(true);
        }}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
          !musicEnabledByAdmin && 'cursor-not-allowed opacity-40',
          buttonClassName,
        )}
      >
        {audiblyOn ? <VolumeOnIcon /> : <VolumeOffIcon />}
      </button>

      {open && musicEnabledByAdmin && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-white/15 bg-quiz-surface-strong p-3 shadow-lg backdrop-blur-sm">
          <label htmlFor="player-volume" className="mb-2 block text-label-xs font-bold uppercase tracking-[0.14em] text-white/70">
            Volume
          </label>
          <input
            id="player-volume"
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-full accent-quiz-highlight"
          />
          <button
            type="button"
            onClick={() => toggleLocalMute()}
            className="mt-3 w-full rounded-lg bg-white/10 py-1.5 text-body-sm font-bold text-white hover:bg-white/15"
          >
            {localMuted ? 'Ativar som' : 'Silenciar'}
          </button>
        </div>
      )}
    </div>
  );
}
