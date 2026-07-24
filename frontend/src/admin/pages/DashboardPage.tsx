import { useEffect, useState, useCallback } from 'react';
import { WaitingRoomPanel } from '../components/WaitingRoomPanel';
import { QuestionControlPanel } from '../components/QuestionControlPanel';
import { EditQuizPage } from './QuizEditorPage';
import { useAdminStore } from '../store/useAdminStore';
import { getSocket } from '../../shared/hooks/useSocket';
import type { GameControlFooterState, GameOverFooterState } from '../components/AdminFooter';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface Quiz {
  id: string;
  title: string;
  themeId: string;
  imageUrl: string | null;
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

/** Estado da sala de espera reportado pro rodapé global (AdminPage). */
export interface WaitingRoomFooterState {
  playersCount: number;
  iniciarDisabled: boolean;
  onFinalizarSala: () => void;
  onIniciarJogo: () => void;
}

export function AdminDashboardPage({
  token,
  onQuizzesCountChange,
  onWaitingRoomStateChange,
  onGameControlStateChange,
  onGameOverStateChange,
}: {
  token: string;
  onLogout: () => void;
  adminUsername?: string | null;
  /** Reporta o total de quizzes carregados pro AdminPage, que exibe no rodapé global. */
  onQuizzesCountChange?: (count: number) => void;
  /**
   * Reporta o estado da sala de espera (contagem de jogadores + ações) pro
   * AdminPage, que os exibe no rodapé global no lugar do avatar/contagem de
   * quizzes enquanto a sala estiver aberta. `null` quando a sala não está
   * na tela de espera (ex: seleção de quiz ou partida em andamento).
   */
  onWaitingRoomStateChange?: (state: WaitingRoomFooterState | null) => void;
  /**
   * Reporta o estado de controle da pergunta (tela ativa/resultado) pro
   * AdminPage, que exibe a mensagem "Aguardando respostas…" e os botões
   * Próxima Pergunta / Encerrar Jogo no rodapé global. `null` fora da
   * partida em andamento.
   */
  onGameControlStateChange?: (state: GameControlFooterState | null) => void;
  /** Reporta o estado do game_over pro AdminPage (botões Novo Quiz / Classificação). */
  onGameOverStateChange?: (state: GameOverFooterState | null) => void;
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [roomOpen, setRoomOpen] = useState(false);
  const [quizzesError, setQuizzesError] = useState<string | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [showRanking, setShowRanking] = useState(false);
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [rankingPage, setRankingPage] = useState(0);

  const screen = useAdminStore((s) => s.screen);
  const currentQuestionIndex = useAdminStore((s) => s.currentQuestionIndex);
  const players = useAdminStore((s) => s.players);
  const answeredCount = useAdminStore((s) => s.answeredCount);
  const ranking = useAdminStore((s) => s.ranking);
  const finalRanking = useAdminStore((s) => s.finalRanking);

  const loadQuizzes = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/quizzes`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) {
        throw new Error(`GET /quizzes falhou com status ${r.status}`);
      }
      const d = (await r.json()) as Quiz[];
      setQuizzes(Array.isArray(d) ? d : []);
      setQuizzesError(null);
    } catch (err) {
      console.error(err);
      setQuizzes([]);
      setQuizzesError('Não foi possível carregar os quizzes. Tente novamente.');
    }
  }, [token]);

  useEffect(() => {
    void loadQuizzes();
  }, [loadQuizzes]);

  useEffect(() => {
    onQuizzesCountChange?.(quizzes.length);
  }, [quizzes, onQuizzesCountChange]);

  useEffect(() => {
    if (!selectedQuizId) {
      setQuestions([]);
      return;
    }
    void fetch(`${API_URL}/quizzes/${selectedQuizId}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`GET /quizzes/${selectedQuizId}/questions falhou com status ${r.status}`);
        }
        return r.json();
      })
      .then((d: Question[]) => {
        const list = Array.isArray(d) ? d : [];
        setQuestions([...list].sort((a, b) => a.order - b.order));
      })
      .catch((err: Error) => {
        console.error(err);
        setQuestions([]);
      });
  }, [selectedQuizId, token]);

  useEffect(() => {
    if (screen === 'lobby') setRoomOpen(false);
  }, [screen]);

  const handlePlay = useCallback((quizId: string) => {
    setSelectedQuizId(quizId);
    getSocket().emit('admin:selecionarTema', { quizId });
    setRoomOpen(true);
  }, []);

  const handleLiberarPergunta = useCallback(() => {
    if (!questions[currentQuestionIndex]) return;
    getSocket().emit('admin:liberarPergunta');
  }, [questions, currentQuestionIndex]);

  const handleProximaPergunta = useCallback(() => {
    getSocket().emit('admin:proximaPergunta');
  }, []);

  const handleFinalizarJogo = useCallback(() => {
    getSocket().emit('admin:finalizarJogo');
  }, []);

  const handleFinalizarSala = useCallback(() => {
    getSocket().emit('admin:encerrarSala');
    setRoomOpen(false);
  }, []);

  const handleFinalizarSalaClick = useCallback(() => {
    if (window.confirm('Encerrar a sala? Os jogadores serão desconectados.')) {
      handleFinalizarSala();
    }
  }, [handleFinalizarSala]);

  // Reporta pro AdminPage o estado do rodapé global enquanto a sala de
  // espera (lobby + roomOpen) estiver ativa; `null` em qualquer outro caso
  // (seleção de quiz, edição, ou partida em andamento).
  useEffect(() => {
    const active = screen === 'lobby' && roomOpen && !editingQuizId;
    onWaitingRoomStateChange?.(
      active
        ? {
            playersCount: players.length,
            iniciarDisabled: players.length === 0,
            onFinalizarSala: handleFinalizarSalaClick,
            onIniciarJogo: handleLiberarPergunta,
          }
        : null,
    );
  }, [
    screen,
    roomOpen,
    editingQuizId,
    players.length,
    handleFinalizarSalaClick,
    handleLiberarPergunta,
    onWaitingRoomStateChange,
  ]);

  // Limpa o rodapé global ao desmontar (ex: troca de aba).
  useEffect(() => {
    return () => {
      onWaitingRoomStateChange?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLastQuestion = currentQuestionIndex >= questions.length - 1;

  // Reporta pro AdminPage o estado de controle da pergunta (partida em
  // andamento) enquanto a tela estiver em `question_active` ou
  // `showing_result`; `null` em qualquer outro caso.
  useEffect(() => {
    const active = screen === 'question_active' || screen === 'showing_result';
    onGameControlStateChange?.(
      active
        ? {
            screen,
            isLastQuestion,
            answeredCount,
            totalPlayers: players.length,
            totalQuestions: questions.length,
            currentQuestion: currentQuestionIndex + 1,
            showingRanking: showRanking,
            onRanking: () => setShowRanking(true),
            onProximaPergunta: () => { handleProximaPergunta(); setShowRanking(false); },
            onEncerrarJogo: handleFinalizarJogo,
          }
        : null,
    );
  }, [screen, isLastQuestion, answeredCount, players.length, questions.length, currentQuestionIndex, showRanking, handleProximaPergunta, handleFinalizarJogo, onGameControlStateChange]);

  // Limpa o rodapé global ao desmontar.
  useEffect(() => {
    return () => {
      onGameControlStateChange?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reporta pro AdminPage o estado do game_over (botões Novo Quiz / Classificação).
  useEffect(() => {
    onGameOverStateChange?.(
      screen === 'game_over'
        ? {
            onNovoQuiz: handleFinalizarSala,
            onClassificacao: () => setShowFullRanking(true),
            showingClassificacao: showFullRanking,
            onVoltarPodium: () => setShowFullRanking(false),
          }
        : null,
    );
  }, [screen, showFullRanking, handleFinalizarSala, onGameOverStateChange]);

  // Limpa o rodapé de game_over ao desmontar.
  useEffect(() => {
    return () => {
      onGameOverStateChange?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reseta a visualização de ranking ao mudar de tela.
  useEffect(() => {
    setShowRanking(false);
  }, [screen]);

  if (screen === 'lobby') {
    if (editingQuizId) {
      return (
        <EditQuizPage
          quizId={editingQuizId}
          token={token}
          onClose={() => setEditingQuizId(null)}
          onSaved={() => {
            void loadQuizzes();
          }}
        />
      );
    }

    return (
      <WaitingRoomPanel
        quizzes={quizzes}
        selectedQuizId={selectedQuizId}
        onPlay={handlePlay}
        onEditQuiz={setEditingQuizId}
        roomOpen={roomOpen}
        quizzesError={quizzesError}
      />
    );
  }

  if (screen === 'game_over' && showFullRanking) {
    const pageSize = 10;
    const totalPages = Math.ceil(finalRanking.length / pageSize);
    const pageEntries = finalRanking.slice(rankingPage * pageSize, (rankingPage + 1) * pageSize);

    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
        <div className="flex flex-1 flex-col items-center gap-4 overflow-auto px-4 py-6">
          <h2 className="font-black text-3xl">Classificação Completa</h2>
          <div className="w-full max-w-2xl rounded-2xl border border-quiz-border bg-quiz-surface/50 overflow-hidden">
            <table className="w-full text-base">
              <thead className="bg-quiz-surface-strong text-sm uppercase text-quiz-text-muted">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Jogador</th>
                  <th className="px-5 py-3 text-right">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {pageEntries.map((r, idx) => (
                  <tr key={idx} className="border-t border-quiz-border">
                    <td className="px-5 py-3 font-mono font-bold text-quiz-text-muted">{rankingPage * pageSize + idx + 1}</td>
                    <td className="px-5 py-3 font-bold text-white">{r.avatar ?? ''} {r.nickname}</td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-white">{r.score?.toLocaleString() ?? '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={rankingPage === 0}
                onClick={() => setRankingPage((p) => p - 1)}
                className="rounded-lg bg-quiz-surface px-3 py-1.5 text-sm font-bold text-white disabled:opacity-40 transition-all active:scale-95"
              >
                ‹ Anterior
              </button>
              <span className="text-sm font-bold text-white/70">
                {rankingPage + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={rankingPage >= totalPages - 1}
                onClick={() => setRankingPage((p) => p + 1)}
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

  if (screen === 'game_over') {
    const top3 = finalRanking.slice(0, 3);
    const fourth = finalRanking[3] ?? null;
    const fifth = finalRanking[4] ?? null;

    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-6">
          <h2 className="font-black text-4xl sm:text-5xl">Pódio</h2>

          {/* Top 3 podium */}
          <div className="flex items-end justify-center gap-3 sm:gap-5">
            {/* 2nd place */}
            {top3[1] && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">{top3[1].avatar}</span>
                <span className="text-sm font-bold truncate max-w-20">{top3[1].nickname}</span>
                <div className="flex h-24 w-20 items-end justify-center rounded-t-xl bg-quiz-surface-strong border border-quiz-border">
                  <span className="pb-2 font-mono text-2xl font-black text-white/80">2</span>
                </div>
                <span className="text-xs font-bold text-quiz-text-muted">{top3[1].score?.toLocaleString()}</span>
              </div>
            )}
            {/* 1st place */}
            {top3[0] && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">👑</span>
                <span className="text-4xl">{top3[0].avatar}</span>
                <span className="text-base font-black truncate max-w-24">{top3[0].nickname}</span>
                <div className="flex h-32 w-24 items-end justify-center rounded-t-xl bg-quiz-highlight border border-quiz-border">
                  <span className="pb-2 font-mono text-3xl font-black text-quiz-highlight-foreground">1</span>
                </div>
                <span className="text-sm font-black text-quiz-highlight-foreground bg-quiz-highlight rounded-full px-3 py-0.5">{top3[0].score?.toLocaleString()}</span>
              </div>
            )}
            {/* 3rd place */}
            {top3[2] && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">{top3[2].avatar}</span>
                <span className="text-sm font-bold truncate max-w-20">{top3[2].nickname}</span>
                <div className="flex h-18 w-20 items-end justify-center rounded-t-xl bg-quiz-surface-strong border border-quiz-border">
                  <span className="pb-2 font-mono text-2xl font-black text-white/80">3</span>
                </div>
                <span className="text-xs font-bold text-quiz-text-muted">{top3[2].score?.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* 4th and 5th as smaller pills */}
          {(fourth || fifth) && (
            <div className="flex items-center gap-3">
              {fourth && (
                <div className="flex items-center gap-2 rounded-full bg-quiz-surface-strong/80 border border-quiz-border px-4 py-2">
                  <span className="font-mono text-sm font-bold text-quiz-text-muted">4º</span>
                  <span className="text-lg">{fourth.avatar}</span>
                  <span className="text-sm font-bold text-white truncate max-w-24">{fourth.nickname}</span>
                  <span className="text-xs font-mono font-bold text-quiz-text-muted">{fourth.score?.toLocaleString()}</span>
                </div>
              )}
              {fifth && (
                <div className="flex items-center gap-2 rounded-full bg-quiz-surface-strong/80 border border-quiz-border px-4 py-2">
                  <span className="font-mono text-sm font-bold text-quiz-text-muted">5º</span>
                  <span className="text-lg">{fifth.avatar}</span>
                  <span className="text-sm font-bold text-white truncate max-w-24">{fifth.nickname}</span>
                  <span className="text-xs font-mono font-bold text-quiz-text-muted">{fifth.score?.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Tela de controle da pergunta — layout próprio, sem AdminScreenLayout:
  // sem barra superior de título/badge, sem sidebar de jogadores, sem
  // rodapé branco de sub-informações e sem scroll. O contador de tempo
  // (em question_active) fica no canto superior direito da própria
  // pergunta, e as ações/mensagem de espera vivem no rodapé global
  // (AdminFooter), via onGameControlStateChange.
  if (screen === 'showing_result' && showRanking) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-6">
          <h2 className="font-black text-4xl sm:text-5xl">Ranking</h2>
          <div className="w-full max-w-lg rounded-2xl border border-quiz-border bg-quiz-surface/50 overflow-hidden">
            <table className="w-full text-base">
              <thead className="bg-quiz-surface-strong text-sm uppercase text-quiz-text-muted">
                <tr>
                  <th className="px-5 py-4 text-left">#</th>
                  <th className="px-5 py-4 text-left">Jogador</th>
                  <th className="px-5 py-4 text-right">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {ranking.slice(0, 5).map((r, idx) => (
                  <tr key={idx} className="border-t border-quiz-border">
                    <td className="px-5 py-4 font-mono text-lg font-bold text-quiz-text-muted">{idx + 1}</td>
                    <td className="px-5 py-4 text-lg font-bold text-white">{r.avatar ?? ''} {r.nickname}</td>
                    <td className="px-5 py-4 text-right font-mono text-lg font-bold text-white">{r.score?.toLocaleString() ?? '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
      <QuestionControlPanel questions={questions} />
    </div>
  );
}