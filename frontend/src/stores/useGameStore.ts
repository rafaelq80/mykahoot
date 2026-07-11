import { create } from 'zustand';
import type {
  GameEstadoEvent,
  GamePerguntaEvent,
  GameResultadoPerguntaEvent,
  GameFimEvent,
} from '../types/events';

export type GameScreen =
  | 'connecting'
  | 'entry'
  | 'lobby'
  | 'question'
  | 'question_result'
  | 'final_ranking';

export interface PlayerInfo {
  nickname: string;
  avatar: string;
}

export interface QuestionData {
  questionId: string;
  text: string;
  imageUrl: string | null;
  options: string[];
  timeLimitSec: number;
}

export interface QuestionResult {
  correctIndex: number;
  top5: { nickname: string; avatar: string; score: number }[];
  you: { correct: boolean; selectedIndex: number; score: number; position: number };
}

export interface FinalResult {
  top5: { nickname: string; avatar: string; score: number }[];
  you: { score: number; position: number };
}

interface GameState {
  screen: GameScreen;
  playerCount: number;
  playerInfo: PlayerInfo | null;
  question: QuestionData | null;
  questionNumber: number;
  totalQuestions: number;
  questionResult: QuestionResult | null;
  finalResult: FinalResult | null;
  hasAnswered: boolean;
  selectedIndex: number | null;
  timer: number;
  errorMessage: string | null;
  /** Pontuação acumulada do jogador — atualizada a cada resultado, mas
   *  NÃO é limpa quando uma nova pergunta chega (diferente de questionResult,
   *  que serve só pra destacar a alternativa certa/errada da rodada). */
  currentScore: number;
  /** Posição atual no ranking (1-based) — mesma lógica acima. */
  currentPosition: number | null;

  // Actions
  setScreen: (screen: GameScreen) => void;
  setPlayerInfo: (info: PlayerInfo | null) => void;
  setTimer: (t: number) => void;
  setErrorMessage: (msg: string | null) => void;
  handleEstado: (data: GameEstadoEvent) => void;
  handlePergunta: (data: GamePerguntaEvent) => void;
  handleResultado: (data: GameResultadoPerguntaEvent) => void;
  handleFim: (data: GameFimEvent) => void;
  answer: (idx: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'connecting',
  playerCount: 0,
  playerInfo: null,
  question: null,
  questionNumber: 0,
  totalQuestions: 0,
  questionResult: null,
  finalResult: null,
  hasAnswered: false,
  selectedIndex: null,
  timer: 0,
  errorMessage: null,
  currentScore: 0,
  currentPosition: null,

  setScreen: (screen) => set({ screen }),
  setPlayerInfo: (info) => set({ playerInfo: info }),
  setTimer: (t) => set({ timer: t }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),

  handleEstado: (data) => {
    const { playerInfo } = get();
    set({
      playerCount: data.playerCount,
      errorMessage: null,
      ...(data.totalQuestions != null ? { totalQuestions: data.totalQuestions } : {}),
    });

    if (data.status === 'lobby') {
      set((s) => {
        if (s.screen === 'entry' || s.screen === 'connecting') {
          return { screen: playerInfo ? 'lobby' : 'entry' };
        }
        return {};
      });
    } else if (data.status === 'inativo') {
      set({
        screen: 'entry',
        playerInfo: null,
        question: null,
        questionNumber: 0,
        questionResult: null,
        finalResult: null,
        timer: 0,
        currentScore: 0,
        currentPosition: null,
      });
    }
  },

  handlePergunta: (data) => {
    set({
      question: {
        questionId: data.questionId,
        text: data.text,
        imageUrl: data.imageUrl,
        options: data.options,
        timeLimitSec: data.timeLimitSec,
      },
      questionNumber: data.order,
      totalQuestions: data.totalQuestions,
      questionResult: null,
      hasAnswered: false,
      selectedIndex: null,
      screen: 'question',
      timer: data.timeLimitSec,
    });
  },

  handleResultado: (data) => {
    set({
      questionResult: {
        correctIndex: data.correctIndex,
        top5: data.top5,
        you: data.you,
      },
      currentScore: data.you.score,
      currentPosition: data.you.position,
      screen: 'question_result',
      timer: 0,
    });
  },

  handleFim: (data) => {
    set({
      finalResult: { top5: data.top5, you: data.you },
      currentScore: data.you.score,
      currentPosition: data.you.position,
      screen: 'final_ranking',
      timer: 0,
    });
  },

  answer: (idx) => {
    if (get().hasAnswered) return;
    set({ hasAnswered: true, selectedIndex: idx });
  },

  reset: () =>
    set({
      screen: 'connecting',
      playerCount: 0,
      playerInfo: null,
      question: null,
      questionNumber: 0,
      totalQuestions: 0,
      questionResult: null,
      finalResult: null,
      hasAnswered: false,
      selectedIndex: null,
      timer: 0,
      errorMessage: null,
      currentScore: 0,
      currentPosition: null,
    }),
}));