import { useAdminStore } from '../../../stores/useAdminStore';
import { cn } from '../../../lib/utils';

const ICONS = ['▲', '◆', '●', '■'] as const;

export function FullScoreboardTable() {
  const ranking = useAdminStore((s) => s.ranking);
  const finalRanking = useAdminStore((s) => s.finalRanking);
  const screen = useAdminStore((s) => s.screen);

  const rows = screen === 'game_over'
    ? finalRanking.map((r) => ({ ...r, correct: undefined, selectedIndex: -1 }))
    : [...ranking].sort((a, b) => b.score - a.score);

  if (rows.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border-2 border-white/20 bg-white shadow-md">
      <div className="border-b border-surface-container px-4 py-3">
        <h3 className="font-black text-brand">Placar completo</h3>
      </div>
      <table className="w-full text-sm" aria-label="Placar completo">
        <thead className="bg-surface-container text-xs uppercase text-gray-500">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Jogador</th>
            <th className="px-3 py-2 text-right">Pts</th>
            {screen === 'showing_result' && <th className="px-3 py-2 text-center">Resp.</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((entry, idx) => (
            <tr key={entry.nickname + idx} className="border-t border-surface-container">
              <td className="px-3 py-2 font-mono text-gray-400">{idx + 1}</td>
              <td className="px-3 py-2 font-medium">
                {entry.avatar} {entry.nickname}
              </td>
              <td className="px-3 py-2 text-right font-mono font-bold text-brand">
                {entry.score.toLocaleString()}
              </td>
              {screen === 'showing_result' && 'correct' in entry && (
                <td
                  className={cn(
                    'px-3 py-2 text-center font-mono',
                    entry.correct ? 'text-green-600' : 'text-option-a',
                  )}
                >
                  {entry.selectedIndex === -1
                    ? '—'
                    : `${ICONS[entry.selectedIndex]} ${entry.correct ? '✓' : '✗'}`}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
