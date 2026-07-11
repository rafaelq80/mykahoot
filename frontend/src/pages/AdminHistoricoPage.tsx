import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

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
    void fetch(`${API_URL}/game/sessions`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d: GameSession[]) => { setSessions(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex min-h-dvh items-center justify-center bg-surface">
      <p className="animate-pulse font-bold text-brand">Carregando...</p>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* List */}
        <aside className="flex flex-col gap-2 border-r border-surface-container p-4 lg:w-80">
          <h2 className="font-black text-lg text-brand mb-2">Histórico de Partidas</h2>
          {sessions.length === 0 && <p className="text-sm text-gray-400">Nenhuma partida registrada.</p>}
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(s)}
              className={cn(
                'flex items-center justify-between rounded-xl border p-3 text-left transition-colors',
                selected?.id === s.id ? 'border-brand bg-brand/5' : 'border-surface-container hover:bg-surface-container',
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm">{s.quiz.title}</span>
                <span className="text-xs text-gray-400">
                  {s.quiz.theme.name} · {new Date(s.playedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {s.status === 'finalizado'
                ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">✓ COMPLETA</span>
                : <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">⚠ INTERROMPIDA</span>
              }
            </button>
          ))}
        </aside>

        {/* Detail */}
        <div className="flex flex-1 flex-col gap-4 p-5">
          {!selected && <p className="text-gray-400">Selecione uma partida para ver os detalhes.</p>}
          {selected && (
            <>
              <div>
                <h3 className="font-black text-2xl text-brand">{selected.quiz.title}</h3>
                <p className="text-sm text-gray-500">
                  {selected.quiz.theme.name} · {new Date(selected.playedAt).toLocaleString('pt-BR')} · {selected.status === 'finalizado' ? '✓ Completa' : '⚠ Interrompida'}
                </p>
              </div>
              {selected.results.length === 0
                ? <p className="text-sm text-gray-400">Nenhum jogador registrado.</p>
                : (
                  <div className="rounded-xl border border-surface-container overflow-hidden">
                    <table className="w-full text-sm" aria-label="Resultados">
                      <thead className="bg-surface-container text-xs uppercase text-gray-500">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Jogador</th>
                          <th className="px-3 py-2 text-right">Pontuação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...selected.results].sort((a, b) => b.score - a.score).map((r, idx) => (
                          <tr key={r.id} className="border-t border-surface-container">
                            <td className="px-3 py-2 font-mono text-gray-400">{idx + 1}</td>
                            <td className="px-3 py-2 font-medium">{r.avatar} {r.nickname}</td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-brand">{r.score.toLocaleString()}</td>
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
  );
}
