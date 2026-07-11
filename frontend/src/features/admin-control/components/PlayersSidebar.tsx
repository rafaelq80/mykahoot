import { useAdminStore } from '../../../stores/useAdminStore';

export function PlayersSidebar() {
  const players = useAdminStore((s) => s.players);

  return (
    <aside className="flex flex-col gap-3 border-r-2 border-surface-container bg-surface-container lg:w-72 lg:min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <p className="font-black text-sm uppercase tracking-widest text-gray-500">Jogadores</p>
        <span className="rounded-full bg-brand px-3 py-0.5 font-black text-sm text-white tabular-nums">
          {players.length}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-1.5 overflow-y-auto px-3 pb-4">
        {players.length === 0 && (
          <p className="rounded-xl bg-surface px-3 py-3 text-xs font-medium text-gray-400 text-center">
            Nenhum jogador ainda
          </p>
        )}
        {players.map((p) => (
          <div
            key={p.socketId}
            className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5 shadow-sm"
          >
            <span className="text-2xl shrink-0" aria-hidden="true">{p.avatar}</span>
            <span className="font-bold text-sm text-gray-800 truncate">{p.nickname}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
