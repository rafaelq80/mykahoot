import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { getSocket } from '../../shared/hooks/useSocket';
import { useAdminStore } from '../store/useAdminStore';
import { useSettingsStore } from '../../shared/store/useSettingsStore';

function VolumeOnIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
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

interface AdminMusicControlProps {
  className?: string;
  buttonClassName?: string;
}

/** Professor liga/desliga música para todos os participantes */
export function AdminMusicControl({ className, buttonClassName }: AdminMusicControlProps) {
  const musicEnabled = useAdminStore((s) => s.musicEnabledByAdmin);
  const volume = useSettingsStore((s) => s.volume);
  const setVolume = useSettingsStore((s) => s.setVolume);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggleGlobal = () => {
    const next = !musicEnabled;
    getSocket().emit('admin:musica', { enabled: next });
    useAdminStore.getState().setMusicEnabledByAdmin(next);
    setOpen(true);
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        aria-label={musicEnabled ? 'Desligar música para todos' : 'Ligar música para todos'}
        aria-pressed={musicEnabled}
        onClick={toggleGlobal}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          buttonClassName,
        )}
      >
        {musicEnabled ? <VolumeOnIcon /> : <VolumeOffIcon />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-surface-container bg-white p-3 shadow-lg">
          <p className="mb-2 text-label-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            Música global
          </p>
          <p className="mb-3 text-body-sm text-gray-600">
            {musicEnabled ? 'Tocando para todos' : 'Desligada para todos'}
          </p>
          <label htmlFor="admin-music-volume" className="mb-2 block text-label-xs font-bold uppercase tracking-[0.14em] text-gray-400">
            Seu volume
          </label>
          <input
            id="admin-music-volume"
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-full accent-brand"
          />
        </div>
      )}
    </div>
  );
}
