import { useCallback, useEffect, useState } from 'react';
import { getSocket } from './useSocket';
import type {
  AdminEstadoEvent,
  AdminEstadoPlayer,
  AdminPlacarEvent,
  AdminPlacarEntry,
  AdminFimEvent,
  AdminFimEntry,
} from '../types/events';

export type AdminScreen = 'login' | 'lobby' | 'question_active' | 'showing_result' | 'game_over';

export interface AdminQuestionInfo {
  questionId: string;
  text: string;
  imageUrl: string | null;
  options: string[];
  timeLimitSec: number;
}

export function useAdmin(token: string | null) {
  const [screen, setScreen] = useState<AdminScreen>('lobby');
  const [players, setPlayers] = useState<AdminEstadoPlayer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<AdminQuestionInfo | null>(null);
  const [ranking, setRanking] = useState<AdminPlacarEntry[]>([]);
  const [finalRanking, setFinalRanking] = useState<AdminFimEntry[]>([]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer countdown (local, seeded from question timeLimitSec)
  useEffect(() => {
    if (screen !== 'question_active' || timer <= 0) return;
    const id = setInterval(() => {
      setTimer((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [screen, timer]);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket();

    const onAdminEstado = (data: AdminEstadoEvent) => {
      setPlayers(data.players);
      setCurrentQuestionIndex(data.currentQuestionIndex);
      setTotalCount(data.players.length);
      setErrorMessage(null);

      if (data.status === 'lobby') setScreen('lobby');
      else if (data.status === 'pergunta_ativa') setScreen('question_active');
      else if (data.status === 'mostrando_resultado') setScreen('showing_result');
      else if (data.status === 'finalizado') setScreen('game_over');
    };

    const onAdminPlacar = (data: AdminPlacarEvent) => {
      setRanking(data.ranking);
      setCorrectIndex(data.correctIndex);
      // Count how many answered correctly or at all
      const answered = data.ranking.filter((r) => r.selectedIndex !== -1).length;
      setAnsweredCount(answered);
      setScreen('showing_result');
    };

    const onAdminFim = (data: AdminFimEvent) => {
      setFinalRanking(data.ranking);
      setScreen('game_over');
    };

    const onGameErro = (data: { message: string }) => {
      setErrorMessage(data.message);
    };

    socket.on('admin:estado', onAdminEstado);
    socket.on('admin:placar', onAdminPlacar);
    socket.on('admin:fim', onAdminFim);
    socket.on('game:erro', onGameErro);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off('admin:estado', onAdminEstado);
      socket.off('admin:placar', onAdminPlacar);
      socket.off('admin:fim', onAdminFim);
      socket.off('game:erro', onGameErro);
    };
  }, [token]);

  const selecionarQuiz = useCallback((quizId: string) => {
    const socket = getSocket();
    socket.emit('admin:selecionarTema', { quizId });
  }, []);

  const liberarPergunta = useCallback((question: AdminQuestionInfo) => {
    const socket = getSocket();
    socket.emit('admin:liberarPergunta');
    setCurrentQuestion(question);
    setTimer(question.timeLimitSec);
    setAnsweredCount(0);
    setScreen('question_active');
  }, []);

  const proximaPergunta = useCallback((nextQuestion: AdminQuestionInfo | null) => {
    const socket = getSocket();
    socket.emit('admin:proximaPergunta');
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setTimer(nextQuestion.timeLimitSec);
      setAnsweredCount(0);
      setScreen('question_active');
    }
  }, []);

  return {
    screen,
    players,
    currentQuestionIndex,
    currentQuestion,
    setCurrentQuestion,
    ranking,
    finalRanking,
    correctIndex,
    answeredCount,
    totalCount,
    timer,
    errorMessage,
    selecionarQuiz,
    liberarPergunta,
    proximaPergunta,
  };
}
