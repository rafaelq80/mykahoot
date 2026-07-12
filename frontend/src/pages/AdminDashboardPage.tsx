import { useEffect, useState, useCallback } from 'react';
import { useAdminSocket } from '../features/admin-control/hooks/useAdminSocket';
import { WaitingRoomPanel } from '../features/admin-control/components/WaitingRoomPanel';
import { QuestionControlPanel } from '../features/admin-control/components/QuestionControlPanel';
import { PlayersSidebar } from '../features/admin-control/components/PlayersSidebar';
import { FullScoreboardTable } from '../features/admin-control/components/FullScoreboardTable';
import { useAdminStore } from '../stores/useAdminStore';

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
  // Track whether the professor has opened the room (sent admin:selecionarTema)
  const [roomOpen, setRoomOpen] = useState(false);

  const screen = useAdminStore((s) => s.screen);
  const currentQuestionIndex = useAdminStore((s) => s.currentQuestionIndex);
  const { selecionarQuiz, liberarPergunta, proximaPergunta, encerrarSala } = useAdminSocket(token);

  useEffect(() => {
    void fetch(`${API_URL}/quizzes`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d: Quiz[]) => setQuizzes(d)).catch(() => null);
  }, [token]);

  useEffect(() => {
    if (!selectedQuizId) { setQuestions([]); return; }
    void fetch(`${API_URL}/quizzes/${selectedQuizId}/questions`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: Question[]) => setQuestions([...d].sort((a, b) => a.order - b.order)))
      .catch(() => setQuestions([]));
  }, [selectedQuizId, token]);

  const handleAbrirSala = useCallback(() => {
    if (!selectedQuizId) return;
    selecionarQuiz(selectedQuizId);
    setRoomOpen(true);
  }, [selectedQuizId, selecionarQuiz]);

  const handleLiberarPergunta = useCallback(() => {
    const q = questions[currentQuestionIndex];
    if (!q) return;
    liberarPergunta(q.timeLimitSec);
  }, [questions, currentQuestionIndex, liberarPergunta]);

  const handleFinalizarSala = useCallback(() => {
    encerrarSala();
    setRoomOpen(false);
  }, [encerrarSala]);

  /* ── Lobby ── */
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

  /* ── Active game: sidebar + control panel ── */
  return (
    <div className="flex flex-1 flex-col lg:flex-row bg-brand">
      <PlayersSidebar />
      <div className="flex flex-1 flex-col gap-5 p-5">
        <QuestionControlPanel
          questions={questions}
          quizzes={quizzes}
          selectedQuizId={selectedQuizId}
          onSelectQuiz={setSelectedQuizId}
          onAbrirSala={handleAbrirSala}
          onLiberarPergunta={handleLiberarPergunta}
          onProximaPergunta={proximaPergunta}
        />
        <FullScoreboardTable />
      </div>
    </div>
  );
}