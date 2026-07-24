import { useEffect, useState, useCallback } from 'react';
import { WaitingRoomPanel } from '../components/WaitingRoomPanel';
import { QuestionControlPanel } from '../components/QuestionControlPanel';
import { AdminRankingView } from '../components/AdminRankingView';
import { AdminPodiumView } from '../components/AdminPodiumView';
import { AdminFullRankingView } from '../components/AdminFullRankingView';
import { QuizFormPage } from './QuizFormPage';
import { useAdminStore } from '../store/useAdminStore';
import { useQuizzes } from '../hooks/useQuizzes';
import { useQuestions } from '../hooks/useQuestions';
import { getSocket } from '../../shared/hooks/useSocket';
import type { GameControlFooterState, GameOverFooterState } from '../components/AdminFooter';

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
  onQuizzesCountChange?: (count: number) => void;
  onWaitingRoomStateChange?: (state: WaitingRoomFooterState | null) => void;
  onGameControlStateChange?: (state: GameControlFooterState | null) => void;
  onGameOverStateChange?: (state: GameOverFooterState | null) => void;
}) {
  const { quizzes, reload: reloadQuizzes, error: quizzesError } = useQuizzes(token);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const { questions } = useQuestions(token, selectedQuizId || null);
  const [roomOpen, setRoomOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [showRanking, setShowRanking] = useState(false);
  const [showFullRanking, setShowFullRanking] = useState(false);

  const screen = useAdminStore((s) => s.screen);
  const currentQuestionIndex = useAdminStore((s) => s.currentQuestionIndex);
  const players = useAdminStore((s) => s.players);
  const answeredCount = useAdminStore((s) => s.answeredCount);
  const ranking = useAdminStore((s) => s.ranking);
  const finalRanking = useAdminStore((s) => s.finalRanking);

  // Report quiz count to parent
  useEffect(() => {
    onQuizzesCountChange?.(quizzes.length);
  }, [quizzes.length, onQuizzesCountChange]);

  useEffect(() => {
    if (screen === 'lobby') setRoomOpen(false);
  }, [screen]);

  // --- Socket actions ---
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

  // --- Footer state reporting ---
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
  }, [screen, roomOpen, editingQuizId, players.length, handleFinalizarSalaClick, handleLiberarPergunta, onWaitingRoomStateChange]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => { onWaitingRoomStateChange?.(null); }, []);

  const isLastQuestion = currentQuestionIndex >= questions.length - 1;

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => { onGameControlStateChange?.(null); }, []);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => { onGameOverStateChange?.(null); }, []);

  useEffect(() => { setShowRanking(false); }, [screen]);

  // --- Render ---
  if (screen === 'lobby') {
    if (editingQuizId) {
      return (
        <QuizFormPage
          token={token}
          quizId={editingQuizId}
          onClose={() => setEditingQuizId(null)}
          onSaved={() => { void reloadQuizzes(); }}
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
    if (showFullRanking) return <AdminFullRankingView finalRanking={finalRanking} />;
    return <AdminPodiumView finalRanking={finalRanking} />;
  }

  if (screen === 'showing_result' && showRanking) {
    return <AdminRankingView ranking={ranking} />;
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
      <QuestionControlPanel questions={questions} />
    </div>
  );
}
