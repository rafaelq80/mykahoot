import { useEffect, useState, useCallback } from 'react';
import { WaitingRoomPanel } from '../features/admin-control/components/WaitingRoomPanel';
import { QuestionControlPanel } from '../features/admin-control/components/QuestionControlPanel';
import { PlayersSidebar } from '../features/admin-control/components/PlayersSidebar';
import { FullScoreboardTable } from '../features/admin-control/components/FullScoreboardTable';
import { AdminPodiumPanel } from '../features/admin-control/components/AdminPodiumPanel';
import { AdminScreenLayout } from '../features/admin-control/components/AdminScreenLayout';
import { useAdminStore } from '../stores/useAdminStore';
import { getSocket } from '../hooks/useSocket';
import { cn } from '../lib/utils';

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

export function AdminDashboardPage({ token }: { token: string; onLogout: () => void }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [roomOpen, setRoomOpen] = useState(false);

  const screen = useAdminStore((s) => s.screen);
  const currentQuestionIndex = useAdminStore((s) => s.currentQuestionIndex);
  const timer = useAdminStore((s) => s.timer);
  const answeredCount = useAdminStore((s) => s.answeredCount);
  const players = useAdminStore((s) => s.players);

  useEffect(() => {
    void fetch(`${API_URL}/quizzes`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: Quiz[]) => setQuizzes(d))
      .catch(() => null);
  }, [token]);

  useEffect(() => {
    if (!selectedQuizId) {
      setQuestions([]);
      return;
    }
    void fetch(`${API_URL}/quizzes/${selectedQuizId}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d: Question[]) => setQuestions([...d].sort((a, b) => a.order - b.order)))
      .catch(() => setQuestions([]));
  }, [selectedQuizId, token]);

  useEffect(() => {
    if (screen === 'lobby') setRoomOpen(false);
  }, [screen]);

  const handleAbrirSala = useCallback(() => {
    if (!selectedQuizId) return;
    getSocket().emit('admin:selecionarTema', { quizId: selectedQuizId });
    setRoomOpen(true);
  }, [selectedQuizId]);

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

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);
  const isTimerUrgent = timer > 0 && timer <= 5;

  if (screen === 'lobby') {
    return (
      <WaitingRoomPanel
        quizzes={quizzes}
        selectedQuizId={selectedQuizId}
        onSelectQuiz={setSelectedQuizId}
        onAbrirSala={handleAbrirSala}
        onLiberarPergunta={handleLiberarPergunta}
        onFinalizarSala={handleFinalizarSala}
        roomOpen={roomOpen}
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
                : 'bg-brand text-white',
            )}
          >
            <span className="text-lg">{timer}s</span>
          </div>
        ) : (
          <span className="rounded-full bg-surface-container px-4 py-2 text-label-xs font-bold uppercase tracking-[0.14em] text-brand">
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
