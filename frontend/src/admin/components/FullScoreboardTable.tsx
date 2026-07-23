import { useAdminStore } from '../store/useAdminStore';
import { cn } from '../../lib/utils';

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
    <div className="card-glass-strong w-full overflow-x-auto">
      <div className="border-b border-quiz-border px-4 py-3">
        <h3 className="font-black text-white">Placar completo</h3>
      </div>
      <table className="w-full text-sm" aria-label="Placar completo">
        <thead className="bg-quiz-surface-strong text-xs uppercase text-quiz-text-muted">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Jogador</th>
            <th className="px-3 py-2 text-right">Pts</th>
            {screen === 'showing_result' && <th className="px-3 py-2 text-center">Resp.</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((entry, idx) => (
            <tr key={entry.nickname + idx} className="border-t border-quiz-border">
              <td className="px-3 py-2 font-mono text-quiz-text-muted">{idx + 1}</td>
              <td className="px-3 py-2 font-medium text-white">
                {entry.avatar} {entry.nickname}
              </td>
              <td className="px-3 py-2 text-right font-mono font-bold text-white">
                {entry.score.toLocaleString()}
              </td>
              {screen === 'showing_result' && 'correct' in entry && (
                <td
                  className={cn(
                    'px-3 py-2 text-center font-mono',
                    entry.correct ? 'text-option-d' : 'text-option-a',
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