import { useAdminStore } from '../store/useAdminStore';

export function PlayersSidebar() {
  const players = useAdminStore((s) => s.players);

  return (
    <aside className="card-glass-strong flex w-full shrink-0 flex-col gap-3 lg:w-64 xl:w-72">
      <div className="flex items-center justify-between border-b border-quiz-border px-4 pb-3 pt-5">
        <p className="font-black text-sm uppercase tracking-widest text-quiz-text-muted">Jogadores</p>
        <span className="rounded-full bg-brand px-3 py-0.5 font-black text-sm text-white tabular-nums">
          {players.length}
        </span>
      </div>

      <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto px-3 pb-4 lg:max-h-none lg:flex-1">
        {players.length === 0 && (
          <p className="rounded-xl bg-quiz-surface px-3 py-3 text-center text-xs font-medium text-quiz-text-muted">
            Nenhum jogador ainda
          </p>
        )}
        {players.map((p) => (
          <div
            key={p.socketId}
            className="flex items-center gap-3 rounded-xl bg-quiz-surface px-3 py-2.5"
          >
            <span className="shrink-0 text-2xl" aria-hidden="true">
              {p.avatar}
            </span>
            <span className="truncate text-sm font-bold text-white">{p.nickname}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}