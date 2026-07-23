import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { apiFetch } from '../../services/api';
import { AdminScreenLayout } from '../components/AdminScreenLayout';

interface PlayerResult { id: string; nickname: string; avatar: string; score: number }
interface GameSession {
  id: string; status: string; playedAt: string;
  quiz: { title: string; theme: { name: string } };
  results: PlayerResult[];
}

export function AdminHistoricoPage({ token }: { token: string }) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [selected, setSelected] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void apiFetch<GameSession[]>('/game/sessions', { token })
      .then((d) => { setSessions(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-quiz-bg-to bg-quiz-gradient p-6">
      <p className="animate-pulse font-bold text-white">Carregando...</p>
    </div>
  );

  return (
    <AdminScreenLayout title="Histórico de Partidas" subtitle="Consulte partidas já encerradas">
      <div className="flex flex-1 flex-col px-5 py-6 sm:px-8">
        <div className="card-glass-strong flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* List */}
          <aside className="flex flex-col gap-2 border-b border-quiz-border p-4 lg:w-80 lg:border-b-0 lg:border-r">
            {sessions.length === 0 && <p className="text-sm text-quiz-text-muted">Nenhuma partida registrada.</p>}
            {sessions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s)}
                className={cn(
                  'flex items-center justify-between rounded-xl border p-3 text-left text-white transition-colors',
                  selected?.id === s.id ? 'border-brand bg-brand/20' : 'border-quiz-border hover:bg-quiz-surface',
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-sm">{s.quiz.title}</span>
                  <span className="text-xs text-quiz-text-muted">
                    {s.quiz.theme.name} · {new Date(s.playedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {s.status === 'finalizado'
                  ? <span className="rounded-full bg-option-d/20 px-2 py-0.5 text-xs font-bold text-option-d">✓ COMPLETA</span>
                  : <span className="rounded-full bg-quiz-warn/20 px-2 py-0.5 text-xs font-bold text-quiz-warn">⚠ INTERROMPIDA</span>
                }
              </button>
            ))}
          </aside>

          {/* Detail */}
          <div className="flex flex-1 flex-col gap-4 p-5">
            {!selected && <p className="text-quiz-text-muted">Selecione uma partida para ver os detalhes.</p>}
            {selected && (
              <>
                <div>
                  <h3 className="font-black text-2xl text-white">{selected.quiz.title}</h3>
                  <p className="text-sm text-quiz-text-muted">
                    {selected.quiz.theme.name} · {new Date(selected.playedAt).toLocaleString('pt-BR')} · {selected.status === 'finalizado' ? '✓ Completa' : '⚠ Interrompida'}
                  </p>
                </div>
                {selected.results.length === 0
                  ? <p className="text-sm text-quiz-text-muted">Nenhum jogador registrado.</p>
                  : (
                    <div className="rounded-xl border border-quiz-border overflow-hidden">
                      <table className="w-full text-sm" aria-label="Resultados">
                        <thead className="bg-quiz-surface-strong text-xs uppercase text-quiz-text-muted">
                          <tr>
                            <th className="px-3 py-2 text-left">#</th>
                            <th className="px-3 py-2 text-left">Jogador</th>
                            <th className="px-3 py-2 text-right">Pontuação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...selected.results].sort((a, b) => b.score - a.score).map((r, idx) => (
                            <tr key={r.id} className="border-t border-quiz-border">
                              <td className="px-3 py-2 font-mono text-quiz-text-muted">{idx + 1}</td>
                              <td className="px-3 py-2 font-medium text-white">{r.avatar} {r.nickname}</td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-white">{r.score.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </>
            )}
          </div>
        </div>
      </div>
    </AdminScreenLayout>
  );
}