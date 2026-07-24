import type { AdminPlacarEntry } from '../../types/events';
import { RankingRow } from '../../shared/components/RankingRow';

interface AdminRankingViewProps {
  ranking: AdminPlacarEntry[];
}

export function AdminRankingView({ ranking }: AdminRankingViewProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-6">
        <h2 className="font-black text-4xl sm:text-5xl">Ranking</h2>
        <div className="flex w-full max-w-lg flex-col gap-2">
          {ranking.slice(0, 5).map((r, idx) => (
            <RankingRow
              key={`${r.socketId}-${idx}`}
              position={idx + 1}
              avatar={r.avatar}
              nickname={r.nickname}
              score={r.score}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
