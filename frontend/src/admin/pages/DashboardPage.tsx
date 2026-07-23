import { useEffect, useState, useCallback } from 'react';
import { WaitingRoomPanel } from '../components/WaitingRoomPanel';
import { QuestionControlPanel } from '../components/QuestionControlPanel';
import { FullScoreboardTable } from '../components/FullScoreboardTable';
import { AdminPodiumPanel } from '../components/AdminPodiumPanel';
import { AdminScreenLayout } from '../components/AdminScreenLayout';
import { EditQuizPage } from './QuizEditorPage';
import { useAdminStore } from '../store/useAdminStore';
import { getSocket } from '../../shared/hooks/useSocket';
import type { GameControlFooterState } from '../components/AdminFooter';

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
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [roomOpen, setRoomOpen] = useState(false);
  const [quizzesError, setQuizzesError] = useState<string | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const screen = useAdminStore((s) => s.screen);
  const currentQuestionIndex = useAdminStore((s) => s.currentQuestionIndex);
  const players = useAdminStore((s) => s.players);

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
            onProximaPergunta: handleProximaPergunta,
            onEncerrarJogo: handleFinalizarJogo,
          }
        : null,
    );
  }, [screen, isLastQuestion, handleProximaPergunta, handleFinalizarJogo, onGameControlStateChange]);

  // Limpa o rodapé global ao desmontar.
  useEffect(() => {
    return () => {
      onGameControlStateChange?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

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

  if (screen === 'game_over') {
    return (
      <AdminScreenLayout
        title="Pódio Final"
        badge="Partida encerrada"
        subtitle={selectedQuiz?.title}
        footer={
          <button
            type="button"
            onClick={handleFinalizarSala}
            className="w-full rounded-xl bg-brand py-4 text-base font-black tracking-wide text-white shadow-lg transition-all hover:bg-brand/90 active:scale-95 motion-reduce:transition-none sm:max-w-md sm:ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            NOVA PARTIDA
          </button>
        }
      >
        <div className="flex flex-1 flex-col gap-5 px-5 py-6 sm:px-8">
          <AdminPodiumPanel />
          <FullScoreboardTable />
        </div>
      </AdminScreenLayout>
    );
  }

  // Tela de controle da pergunta — layout próprio, sem AdminScreenLayout:
  // sem barra superior de título/badge, sem sidebar de jogadores, sem
  // rodapé branco de sub-informações e sem scroll. O contador de tempo
  // (em question_active) fica no canto superior direito da própria
  // pergunta, e as ações/mensagem de espera vivem no rodapé global
  // (AdminFooter), via onGameControlStateChange.
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
      <QuestionControlPanel questions={questions} />
    </div>
  );
}