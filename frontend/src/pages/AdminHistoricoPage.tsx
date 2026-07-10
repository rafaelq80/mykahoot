import { useEffect, useState } from 'react';
import styles from '../styles/AdminPage.module.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface PlayerResult {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
}

interface GameSession {
  id: string;
  status: string;
  playedAt: string;
  quiz: { title: string; theme: { name: string } };
  results: PlayerResult[];
}

interface Props {
  token: string;
}

export function AdminHistoricoPage({ token }: Props) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [selected, setSelected] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch(`${API_URL}/game/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: GameSession[]) => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.topBar}>
          <span className={styles.topBarTitle}>Histórico de Partidas</span>
        </div>
        <div style={{ padding: 32, color: 'var(--color-text-muted)' }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <span className={styles.topBarTitle}>Histórico de Partidas</span>
      </div>

      <div className={styles.main}>
        {/* Session list */}
        <aside className={styles.sidebar} style={{ width: 340 }}>
          {sessions.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Nenhuma partida registrada ainda.
            </p>
          )}
          <div className={styles.historyList}>
            {sessions.map((s) => (
              <div
                key={s.id}
                className={styles.historyItem}
                onClick={() => setSelected(s)}
                role="button"
                tabIndex={0}
                aria-pressed={selected?.id === s.id}
                onKeyDown={(e) => e.key === 'Enter' && setSelected(s)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className={styles.historyQuiz}>{s.quiz.title}</span>
                  <span className={styles.historyDate}>
                    {s.quiz.theme.name} —{' '}
                    {new Date(s.playedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {s.status === 'finalizado' ? (
                  <span className={styles.badgeFinalizado} title="Partida finalizada normalmente">
                    ✓ COMPLETA
                  </span>
                ) : (
                  <span
                    className={styles.badgeInterrompida}
                    title="Dados parciais foram salvos"
                  >
                    ⚠ INTERROMPIDA
                  </span>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Session detail */}
        <div className={styles.center}>
          {!selected && (
            <p style={{ color: 'var(--color-text-muted)' }}>
              Selecione uma partida para ver os detalhes.
            </p>
          )}

          {selected && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2
                  style={{
                    fontFamily: 'Boogaloo, sans-serif',
                    fontSize: 'var(--text-2xl)',
                    color: 'var(--color-neon-yellow)',
                  }}
                >
                  {selected.quiz.title}
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Tema: {selected.quiz.theme.name} &nbsp;·&nbsp;{' '}
                  {new Date(selected.playedAt).toLocaleString('pt-BR')} &nbsp;·&nbsp;{' '}
                  {selected.status === 'finalizado' ? '✓ Completa' : '⚠ Interrompida'}
                </p>
              </div>

              {selected.results.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  Nenhum jogador registrado nessa partida.
                </p>
              ) : (
                <table className={styles.rankingTable} aria-label="Resultados da partida">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Jogador</th>
                      <th>Pontuação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.results
                      .slice()
                      .sort((a, b) => b.score - a.score)
                      .map((r, idx) => (
                        <tr key={r.id}>
                          <td
                            style={{
                              fontFamily: 'DM Mono, monospace',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {idx + 1}
                          </td>
                          <td>
                            {r.avatar} {r.nickname}
                          </td>
                          <td
                            style={{
                              fontFamily: 'DM Mono, monospace',
                              color: 'var(--color-neon-yellow)',
                            }}
                          >
                            {r.score.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
