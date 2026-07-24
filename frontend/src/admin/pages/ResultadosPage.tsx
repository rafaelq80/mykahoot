import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import { AdminScreenLayout } from '../components/AdminScreenLayout';
import { Pagination } from '../../shared/components/Pagination';
import { AvatarBadge } from '../../shared/components/AvatarBadge';
import { useTurmas } from '../hooks/useTurmas';

const MEDALS = ['🥇', '🥈', '🥉'] as const;

interface PlayerResult {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  classificacao: number | null;
  alunoId: string | null;
  turmaId: string | null;
}

interface GameSession {
  id: string;
  status: string;
  playedAt: string;
  quiz: { title: string; theme: { name: string } };
  results: PlayerResult[];
}

const PAGE_SIZE = 10;
const RESULT_PAGE_SIZE = 10;

const btnCls = 'rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed';

export function AdminResultadosPage({ token }: { token: string }) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);
  const [page, setPage] = useState(0);
  const [resultPage, setResultPage] = useState(0);
  const { turmas } = useTurmas(token);

  const getTurmaNome = (turmaId: string | null): string => {
    if (!turmaId) return '—';
    return turmas.find((t) => t.id === turmaId)?.nome ?? '—';
  };

  useEffect(() => {
    void apiFetch<GameSession[]>('/game/sessions', { token })
      .then((d) => { setSessions(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <AdminScreenLayout title="Resultados">
        <p className="animate-pulse py-10 text-center font-bold text-quiz-text-muted">Carregando...</p>
      </AdminScreenLayout>
    );
  }

  // Detail view
  const sortedResults = selectedSession
    ? [...selectedSession.results].sort((a, b) => {
        if (a.classificacao != null && b.classificacao != null) return a.classificacao - b.classificacao;
        if (a.classificacao != null) return -1;
        if (b.classificacao != null) return 1;
        return b.score - a.score;
      })
    : [];
  const resultTotalPages = Math.max(1, Math.ceil(sortedResults.length / RESULT_PAGE_SIZE));
  const pageResults = sortedResults.slice(resultPage * RESULT_PAGE_SIZE, (resultPage + 1) * RESULT_PAGE_SIZE);

  if (selectedSession) {
    return (
      <AdminScreenLayout
        title={selectedSession.quiz.title}
        subtitle={`${selectedSession.quiz.theme.name} · ${new Date(selectedSession.playedAt).toLocaleDateString('pt-BR')}`}
        headerRight={
          <button
            type="button"
            onClick={() => { setSelectedSession(null); setResultPage(0); }}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-label-xs font-bold uppercase tracking-[0.14em] text-white transition-all hover:bg-white/25 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          >
            ← Voltar
          </button>
        }
      >
        <div className="flex flex-1 flex-col gap-4 px-5 py-6 sm:px-8">
          {sortedResults.length === 0 ? (
            <p className="py-10 text-center text-sm text-quiz-text-muted">Nenhum jogador registrado nesta partida.</p>
          ) : (
            <>
              <div className="rounded-xl border border-quiz-border overflow-hidden">
                <table className="w-full text-sm" aria-label="Resultados da partida">
                  <thead className="bg-quiz-surface-strong text-xs uppercase text-quiz-text-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Jogador</th>
                      <th className="px-3 py-2 text-left">Turma</th>
                      <th className="px-3 py-2 text-center">Certas</th>
                      <th className="px-3 py-2 text-center">% Acerto</th>
                      <th className="px-3 py-2 text-center">Erradas</th>
                      <th className="px-3 py-2 text-center">% Erro</th>
                      <th className="px-3 py-2 text-right">Pontuação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageResults.map((r, idx) => {
                      const pos = resultPage * RESULT_PAGE_SIZE + idx + 1;
                      const total = (r.correctCount ?? 0) + (r.wrongCount ?? 0);
                      const pctAcerto = total > 0 ? ((r.correctCount ?? 0) / total * 100).toFixed(1) : '—';
                      const pctErro = total > 0 ? ((r.wrongCount ?? 0) / total * 100).toFixed(1) : '—';
                      const posLabel = `${pos}º${pos <= 3 ? ` ${MEDALS[pos - 1]}` : ''}`;
                      return (
                        <tr key={r.id} className="border-t border-quiz-border">
                          <td className="px-3 py-2 text-white font-normal">{posLabel}</td>
                          <td className="px-3 py-2">
                            <AvatarBadge avatar={r.avatar} nickname={r.nickname} />
                          </td>
                          <td className="px-3 py-2 text-white font-normal">{getTurmaNome(r.turmaId)}</td>
                          <td className="px-3 py-2 text-center text-white font-normal">{r.correctCount ?? '—'}</td>
                          <td className="px-3 py-2 text-center text-quiz-text-muted font-normal">{pctAcerto}{pctAcerto !== '—' ? '%' : ''}</td>
                          <td className="px-3 py-2 text-center text-white font-normal">{r.wrongCount ?? '—'}</td>
                          <td className="px-3 py-2 text-center text-quiz-text-muted font-normal">{pctErro}{pctErro !== '—' ? '%' : ''}</td>
                          <td className="px-3 py-2 text-right text-white font-normal">{r.score.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {resultTotalPages > 1 && (
                <Pagination page={resultPage} totalPages={resultTotalPages} onPageChange={setResultPage} />
              )}
            </>
          )}
        </div>
      </AdminScreenLayout>
    );
  }

  // List view
  const totalPages = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE));
  const pageSessions = sessions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <AdminScreenLayout title="Resultados" subtitle="Consulte partidas encerradas">
      <div className="flex flex-1 flex-col gap-4 px-5 py-6 sm:px-8">
        {sessions.length === 0 ? (
          <p className="py-10 text-center text-sm text-quiz-text-muted">Nenhuma partida registrada.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {pageSessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg border border-quiz-border p-3 text-sm text-white">
                  <div className="flex flex-col gap-0.5">
                    <strong>{s.quiz.title}</strong>
                    <span className="text-label-xs text-quiz-text-muted">
                      {s.quiz.theme.name} · {new Date(s.playedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.status === 'finalizado'
                      ? <span className="rounded-full bg-option-d/20 px-2 py-0.5 text-label-xs font-bold text-option-d">✓ COMPLETA</span>
                      : <span className="rounded-full bg-option-a/20 px-2 py-0.5 text-label-xs font-bold text-option-a">⚠ INTERROMPIDA</span>
                    }
                    <button
                      type="button"
                      onClick={() => { setSelectedSession(s); setResultPage(0); }}
                      className={btnCls}
                    >
                      Ver resultados
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </AdminScreenLayout>
  );
}
