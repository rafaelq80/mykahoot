import { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import styles from '../styles/AdminPage.module.css';

const OPTION_ICONS = ['▲', '◆', '●', '■'];
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface Quiz {
  id: string;
  title: string;
  theme: { name: string };
  _count: { questions: number };
}

interface Question {
  id: string;
  text: string;
  imageUrl: string | null;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
  order: number;
}

interface Props {
  token: string;
  onLogout: () => void;
  hideTopBar?: boolean;
}

export function AdminDashboardPage({ token, onLogout, hideTopBar = false }: Props) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const admin = useAdmin(token);

  // Load quizzes once
  useEffect(() => {
    void fetch(`${API_URL}/quizzes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: Quiz[]) => setQuizzes(data))
      .catch(() => {/* silently fail for MVP */});
  }, [token]);

  // Load questions when quiz selected
  useEffect(() => {
    if (!selectedQuizId) {
      setQuestions([]);
      return;
    }
    void fetch(`${API_URL}/quizzes/${selectedQuizId}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: Question[]) =>
        setQuestions([...data].sort((a, b) => a.order - b.order)),
      )
      .catch(() => setQuestions([]));
  }, [selectedQuizId, token]);

  const handleAbrirSala = useCallback(() => {
    if (!selectedQuizId) return;
    admin.selecionarQuiz(selectedQuizId);
  }, [selectedQuizId, admin]);

  const handleLiberarPergunta = useCallback(() => {
    const q = questions[admin.currentQuestionIndex];
    if (!q) return;
    admin.liberarPergunta({
      questionId: q.id,
      text: q.text,
      imageUrl: q.imageUrl,
      options: q.options as string[],
      timeLimitSec: q.timeLimitSec,
    });
  }, [questions, admin]);

  const handleProximaPergunta = useCallback(() => {
    const nextIndex = admin.currentQuestionIndex + 1;
    const nextQ = questions[nextIndex] ?? null;
    admin.proximaPergunta(
      nextQ
        ? {
            questionId: nextQ.id,
            text: nextQ.text,
            imageUrl: nextQ.imageUrl,
            options: nextQ.options as string[],
            timeLimitSec: nextQ.timeLimitSec,
          }
        : null,
    );
  }, [questions, admin]);

  const isLastQuestion = admin.currentQuestionIndex >= questions.length - 1;
  const currentQ = questions[admin.currentQuestionIndex] ?? null;
  const isTimerUrgent = admin.timer > 0 && admin.timer <= 5;

  return (
    <div className={styles.page}>
      {/* Top bar — hidden when rendered inside AdminPage */}
      {!hideTopBar && (
        <div className={styles.topBar}>
          <span className={styles.topBarTitle}>QuizLive — Dashboard</span>
          <div className={styles.topBarRight}>
            <button type="button" className={styles.logoutBtn} onClick={onLogout}>
              Sair
            </button>
          </div>
        </div>
      )}

      {admin.errorMessage && (
        <div role="alert" className={styles.errorBanner}>
          {admin.errorMessage}
        </div>
      )}

      <div className={styles.main}>
        {/* Sidebar — player list */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <p className={styles.sidebarTitle}>
              {admin.players.length === 1
                ? '1 jogador conectado'
                : `${admin.players.length} jogadores conectados`}
            </p>
            {admin.players.map((p) => (
              <div key={p.socketId} className={styles.playerRow}>
                <span className={styles.playerRowAvatar}>{p.avatar}</span>
                <span>{p.nickname}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center */}
        <div className={styles.center}>

          {/* Lobby — quiz selection */}
          {admin.screen === 'lobby' && (
            <>
              <div className={styles.selectGroup}>
                <label className={styles.selectLabel} htmlFor="quiz-select">
                  Selecionar quiz
                </label>
                <select
                  id="quiz-select"
                  className={styles.select}
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                >
                  <option value="">-- Escolha um quiz --</option>
                  {quizzes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title} ({q.theme.name}) — {q._count.questions} perguntas
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className={styles.actionBtn}
                disabled={!selectedQuizId}
                onClick={handleAbrirSala}
              >
                ABRIR SALA
              </button>

              <div className={styles.infoStrip}>
                <div className={styles.infoItem}>
                  <span className={styles.infoValue}>{admin.players.length}</span>
                  <span className={styles.infoLabel}>Aguardando</span>
                </div>
              </div>

              {admin.players.length > 0 && selectedQuizId && (
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleLiberarPergunta}
                >
                  LIBERAR PRIMEIRA PERGUNTA
                </button>
              )}
            </>
          )}

          {/* Question active */}
          {admin.screen === 'question_active' && currentQ && (
            <>
              <div className={styles.infoStrip}>
                <div className={styles.infoItem}>
                  <span className={`${styles.infoValue} ${isTimerUrgent ? styles.timerUrgent : ''}`}
                    style={{ color: isTimerUrgent ? 'var(--color-neon-pink)' : undefined }}>
                    {admin.timer}s
                  </span>
                  <span className={styles.infoLabel}>Tempo restante</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoValue}>
                    {admin.answeredCount}/{admin.players.length}
                  </span>
                  <span className={styles.infoLabel}>Responderam</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoValue}>
                    {admin.currentQuestionIndex + 1}/{questions.length}
                  </span>
                  <span className={styles.infoLabel}>Pergunta</span>
                </div>
              </div>

              <div className={styles.questionCard}>
                <p className={styles.questionNum}>
                  Pergunta {admin.currentQuestionIndex + 1} de {questions.length}
                </p>
                <p className={styles.questionText}>{currentQ.text}</p>
              </div>

              <button type="button" className={styles.actionBtn} disabled>
                AGUARDANDO RESPOSTAS...
              </button>
            </>
          )}

          {/* Showing result */}
          {admin.screen === 'showing_result' && (
            <>
              <div className={styles.infoStrip}>
                <div className={styles.infoItem}>
                  <span className={styles.infoValue}>
                    {admin.currentQuestionIndex + 1}/{questions.length}
                  </span>
                  <span className={styles.infoLabel}>Pergunta</span>
                </div>
                {admin.correctIndex !== null && currentQ && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoValue}>
                      {OPTION_ICONS[admin.correctIndex]}{' '}
                      {(currentQ.options as string[])[admin.correctIndex]}
                    </span>
                    <span className={styles.infoLabel}>Resposta correta</span>
                  </div>
                )}
              </div>

              {admin.ranking.length > 0 && (
                <table className={styles.rankingTable} aria-label="Placar completo">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Jogador</th>
                      <th>Pts</th>
                      <th>Resp.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admin.ranking
                      .slice()
                      .sort((a, b) => b.score - a.score)
                      .map((entry, idx) => (
                        <tr key={entry.socketId}>
                          <td>{idx + 1}</td>
                          <td>
                            {entry.avatar} {entry.nickname}
                          </td>
                          <td>{entry.score.toLocaleString()}</td>
                          <td className={entry.correct ? styles.correct : styles.wrong}>
                            {entry.selectedIndex === -1
                              ? '—'
                              : `${OPTION_ICONS[entry.selectedIndex]} ${entry.correct ? '✓' : '✗'}`}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleProximaPergunta}
              >
                {isLastQuestion ? 'ENCERRAR JOGO' : 'PRÓXIMA PERGUNTA'}
              </button>
            </>
          )}

          {/* Game over */}
          {admin.screen === 'game_over' && (
            <>
              <h2 style={{ fontFamily: 'Boogaloo, sans-serif', fontSize: 'var(--text-2xl)', color: 'var(--color-neon-yellow)' }}>
                🏆 Partida encerrada
              </h2>
              {admin.finalRanking.length > 0 && (
                <table className={styles.rankingTable} aria-label="Ranking final">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Jogador</th>
                      <th>Pontuação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admin.finalRanking.map((entry, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          {entry.avatar} {entry.nickname}
                        </td>
                        <td>{entry.score.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => window.location.reload()}
              >
                NOVA PARTIDA
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
