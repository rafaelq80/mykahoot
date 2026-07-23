import { useEffect, useState, useCallback } from 'react';
import { WaitingRoomPanel } from '../components/WaitingRoomPanel';
import { QuestionControlPanel } from '../components/QuestionControlPanel';
import { PlayersSidebar } from '../components/PlayersSidebar';
import { FullScoreboardTable } from '../components/FullScoreboardTable';
import { AdminPodiumPanel } from '../components/AdminPodiumPanel';
import { AdminScreenLayout } from '../components/AdminScreenLayout';
import { EditQuizPage } from './QuizEditorPage';
import { useAdminStore } from '../store/useAdminStore';
import { getSocket } from '../../shared/hooks/useSocket';
import { cn } from '../../lib/utils';

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
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [roomOpen, setRoomOpen] = useState(false);
  const [quizzesError, setQuizzesError] = useState<string | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const screen = useAdminStore((s) => s.screen);
  const currentQuestionIndex = useAdminStore((s) => s.currentQuestionIndex);
  const timer = useAdminStore((s) => s.timer);
  const answeredCount = useAdminStore((s) => s.answeredCount);
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

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);
  const isTimerUrgent = timer > 0 && timer <= 5;

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

  return (
    <AdminScreenLayout
      title="Controle da Partida"
      badge={`Pergunta ${currentQuestionIndex + 1}/${questions.length}`}
      subtitle={selectedQuiz?.title}
      headerRight={
        screen === 'question_active' ? (
          <div
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 font-extrabold tabular-nums shadow-sm',
              isTimerUrgent
                ? 'animate-pulse bg-option-a text-white motion-reduce:animate-none'
                : 'bg-white/15 text-white',
            )}
          >
            <span className="text-lg">{timer}s</span>
          </div>
        ) : (
          <span className="rounded-full bg-white/15 px-4 py-2 text-label-xs font-bold uppercase tracking-[0.14em] text-white">
            {screen === 'showing_result' ? 'Resultado' : 'Em andamento'}
          </span>
        )
      }
      footer={
        screen === 'question_active' ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body-sm font-medium text-gray-500">
              {answeredCount} de {players.length} jogadores responderam
            </p>
            <p className="rounded-full bg-surface-container px-4 py-2 text-label-xs font-bold uppercase tracking-[0.14em] text-brand">
              Aguardando respostas…
            </p>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-1 flex-col gap-5 px-5 py-6 lg:flex-row sm:px-8">
        <PlayersSidebar />
        <QuestionControlPanel
          questions={questions}
          onProximaPergunta={handleProximaPergunta}
          onEncerrarJogo={handleFinalizarJogo}
        />
      </div>
    </AdminScreenLayout>
  );
}