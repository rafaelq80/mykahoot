import { cn } from '../../lib/utils';
import type { WaitingRoomFooterState } from '../pages/DashboardPage';

interface AdminFooterProps {
  adminUsername: string | null;
  waitingRoom: WaitingRoomFooterState | null;
  quizzesCount: number | null;
}

export function AdminFooter({ adminUsername, waitingRoom, quizzesCount }: AdminFooterProps) {
  return (
    <footer className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-surface-container bg-white px-4 py-2.5 sm:px-6">
      <div className="flex items-center gap-2.5 justify-self-start">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
          {(adminUsername ?? '?').charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-bold text-gray-700">{adminUsername ?? 'Admin'}</span>
      </div>

      {waitingRoom ? (
        <span className="justify-self-center whitespace-nowrap font-black text-lg tabular-nums text-brand sm:text-xl">
          {String(waitingRoom.playersCount).padStart(2, '0')}{' '}
          {waitingRoom.playersCount === 1 ? 'conectado' : 'conectados'}
        </span>
      ) : (
        <span />
      )}

      <div className="justify-self-end">
        {waitingRoom ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={waitingRoom.onFinalizarSala}
              className="rounded-lg border-2 border-option-a bg-white px-3 py-1.5 text-xs font-black tracking-wide text-option-a transition-all hover:bg-option-a/5 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-option-a focus-visible:ring-offset-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              FINALIZAR SALA
            </button>
            <button
              type="button"
              onClick={waitingRoom.onIniciarJogo}
              disabled={waitingRoom.iniciarDisabled}
              className={cn(
                'rounded-lg px-4 py-1.5 text-xs font-black tracking-wide text-white transition-all active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:px-5 sm:py-2 sm:text-sm',
                waitingRoom.iniciarDisabled
                  ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                  : 'cursor-pointer bg-brand shadow-sm hover:bg-brand/90',
              )}
            >
              INICIAR JOGO ›
            </button>
          </div>
        ) : (
          quizzesCount !== null && (
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
              {quizzesCount} {quizzesCount === 1 ? 'quiz disponível' : 'quizzes disponíveis'}
            </span>
          )
        )}
      </div>
    </footer>
  );
}
