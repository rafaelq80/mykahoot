import { TopNavBar } from '../../components/shared/TopNavBar';
import { useGameStore } from '../../stores/useGameStore';

export default function LobbyPage() {
  const playerCount = useGameStore((s) => s.playerCount);
  const playerInfo = useGameStore((s) => s.playerInfo);

  return (
    <div className="relative flex min-h-dvh flex-col bg-brand bg-dot-pattern">
      <TopNavBar />

      {/* Center content */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8 text-white">
        {/* Player card */}
        {playerInfo && (
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-2xl text-5xl shadow-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              aria-hidden="true"
            >
              {playerInfo.avatar}
            </div>
            <p className="font-black text-2xl text-white tracking-tight">
              {playerInfo.nickname}
            </p>
          </div>
        )}

        {/* Waiting status */}
        <div className="flex flex-col items-center gap-3">
          {/* Pulsing dot + label */}
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full bg-white animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
            Aguardando o professor...
          </div>

          {/* Big player count */}
          <p
            className="font-mono font-black tabular-nums leading-none"
            style={{ fontSize: '5rem' }}
            aria-label={`${playerCount} jogadores na sala`}
          >
            {playerCount}
          </p>
          <p className="text-sm text-white/60 font-medium -mt-2">
            {playerCount === 1 ? 'jogador na sala' : 'jogadores na sala'}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Aguardando o início da partida...
      </footer>
    </div>
  );
}
