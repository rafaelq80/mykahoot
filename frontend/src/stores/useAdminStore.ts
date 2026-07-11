import { create } from 'zustand';
import type {
  AdminEstadoEvent,
  AdminPlacarEvent,
  AdminFimEvent,
  AdminEstadoPlayer,
  AdminPlacarEntry,
  AdminFimEntry,
} from '../types/events';

export type AdminScreen = 'lobby' | 'question_active' | 'showing_result' | 'game_over';

interface AdminState {
  screen: AdminScreen;
  players: AdminEstadoPlayer[];
  currentQuestionIndex: number;
  timer: number;
  answeredCount: number;
  ranking: AdminPlacarEntry[];
  finalRanking: AdminFimEntry[];
  correctIndex: number | null;
  errorMessage: string | null;

  // actions
  setTimer: (t: number) => void;
  setErrorMessage: (msg: string | null) => void;
  setAnsweredCount: (n: number) => void;
  handleEstado: (data: AdminEstadoEvent) => void;
  handlePlacar: (data: AdminPlacarEvent) => void;
  handleFim: (data: AdminFimEvent) => void;
  reset: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  screen: 'lobby',
  players: [],
  currentQuestionIndex: 0,
  timer: 0,
  answeredCount: 0,
  ranking: [],
  finalRanking: [],
  correctIndex: null,
  errorMessage: null,

  setTimer: (t) => set({ timer: t }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),
  setAnsweredCount: (n) => set({ answeredCount: n }),

  handleEstado: (data) => {
    const screenMap: Record<string, AdminScreen> = {
      lobby: 'lobby',
      pergunta_ativa: 'question_active',
      mostrando_resultado: 'showing_result',
      finalizado: 'game_over',
    };
    set({
      players: data.players,
      currentQuestionIndex: data.currentQuestionIndex,
      errorMessage: null,
      screen: screenMap[data.status] ?? 'lobby',
    });
  },

  handlePlacar: (data) => {
    const answered = data.ranking.filter((r) => r.selectedIndex !== -1).length;
    set({
      ranking: data.ranking,
      correctIndex: data.correctIndex,
      answeredCount: answered,
      screen: 'showing_result',
    });
  },

  handleFim: (data) => {
    set({ finalRanking: data.ranking, screen: 'game_over' });
  },

  reset: () =>
    set({
      screen: 'lobby',
      players: [],
      currentQuestionIndex: 0,
      timer: 0,
      answeredCount: 0,
      ranking: [],
      finalRanking: [],
      correctIndex: null,
      errorMessage: null,
    }),
}));
