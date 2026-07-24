import { useState } from 'react';
import type { AdminFimEntry } from '../../types/events';
import { RankingRow } from '../../shared/components/RankingRow';

interface AdminFullRankingViewProps {
  finalRanking: AdminFimEntry[];
}

export function AdminFullRankingView({ finalRanking }: AdminFullRankingViewProps) {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(finalRanking.length / pageSize));
  const pageEntries = finalRanking.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
      <div className="flex flex-1 flex-col items-center gap-4 overflow-auto px-4 py-6">
        <h2 className="font-black text-3xl">Classificação Completa</h2>
        <div className="flex w-full max-w-2xl flex-col gap-2">
          {pageEntries.map((r, idx) => (
            <RankingRow
              key={`${r.nickname}-${page * pageSize + idx}`}
              position={page * pageSize + idx + 1}
              avatar={r.avatar ?? ''}
              nickname={r.nickname}
              score={r.score ?? 0}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg bg-quiz-surface px-3 py-1.5 text-sm font-bold text-white disabled:opacity-40 transition-all active:scale-95"
            >
              ‹ Anterior
            </button>
            <span className="text-sm font-bold text-white/70">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg bg-quiz-surface px-3 py-1.5 text-sm font-bold text-white disabled:opacity-40 transition-all active:scale-95"
            >
              Próxima ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
