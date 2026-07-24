import { create } from 'zustand';
import type {
  GameEstadoEvent,
  GamePerguntaEvent,
  GameResultadoPerguntaEvent,
  GameFimEvent,
} from '../../types/events';

// ─── Last Join Info (sessionStorage) ─────────────────────────────────────────
// Cleared when the game resets (sala encerrada) to force fresh entry next time.

const LAST_JOIN_KEY = 'MyKahoot_last_join';

export function clearLastJoinInfo(): void {
  try {
    sessionStorage.removeItem(LAST_JOIN_KEY);
  } catch { /* noop */ }
}

// ─── Store ───────────────────────────────────────────────────────────────────

export type GameScreen =
  | 'connecting'
  | 'entry'
  | 'lobby'
  | 'question'
  | 'question_result'
  | 'final_ranking';

export type GameRoomStatus =
  | 'inativo'
  | 'lobby'
  | 'pergunta_ativa'
  | 'mostrando_resultado'
  | string;

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
  gameStatus: GameRoomStatus;
  joinPending: boolean;
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
  /** Pontos ganhos somente na última rodada resolvida (diferença entre o
   *  score acumulado novo e o anterior). Usado no card "Total Score" e na
   *  tela de resultado — o total acumulado continua em `currentScore`. */
  lastPointsGained: number;
  /** Variação de posição desde a última rodada: positivo = subiu no
   *  ranking, negativo = caiu, null = ainda não há posição anterior pra
   *  comparar (ex: primeira pergunta do jogo). */
  lastPositionChange: number | null;
  musicEnabledByAdmin: boolean;
  /** Título e imagem do quiz atual — vêm do game:estado quando a sala está
   *  aberta; permanecem nulos antes disso (ex: tela inicial "entry"). */
  quizTitle: string | null;
  quizImageUrl: string | null;

  // Actions
  setScreen: (screen: GameScreen) => void;
  setJoinPending: (pending: boolean) => void;
  setPlayerInfo: (info: PlayerInfo | null) => void;
  setTimer: (t: number) => void;
  setErrorMessage: (msg: string | null) => void;
  setMusicEnabledByAdmin: (enabled: boolean) => void;
  handleEstado: (data: GameEstadoEvent) => void;
  handlePergunta: (data: GamePerguntaEvent) => void;
  handleResultado: (data: GameResultadoPerguntaEvent) => void;
  handleFim: (data: GameFimEvent) => void;
  answer: (idx: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'connecting',
  gameStatus: 'inativo',
  joinPending: false,
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
  lastPointsGained: 0,
  lastPositionChange: null,
  musicEnabledByAdmin: false,
  quizTitle: null,
  quizImageUrl: null,

  setScreen: (screen) => set({ screen }),
  setJoinPending: (joinPending) => set({ joinPending }),
  setPlayerInfo: (info) => set({ playerInfo: info }),
  setTimer: (t) => set({ timer: t }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),
  setMusicEnabledByAdmin: (enabled) => set({ musicEnabledByAdmin: enabled }),

  handleEstado: (data) => {
    const { playerInfo } = get();
    set({
      gameStatus: data.status,
      playerCount: data.playerCount,
      errorMessage: null,
      ...(data.totalQuestions != null ? { totalQuestions: data.totalQuestions } : {}),
      ...(data.musicEnabled !== undefined
        ? { musicEnabledByAdmin: data.musicEnabled }
        : {}),
      ...(data.quizTitle !== undefined ? { quizTitle: data.quizTitle } : {}),
      ...(data.quizImageUrl !== undefined ? { quizImageUrl: data.quizImageUrl } : {}),
    });

    if (data.status === 'lobby') {
      set((s) => {
        if (s.joinPending && playerInfo) {
          return { screen: 'lobby', joinPending: false };
        }
        if (s.screen === 'entry' || s.screen === 'connecting') {
          return { screen: playerInfo ? 'lobby' : 'entry' };
        }
        return {};
      });
    } else if (data.status === 'finalizado') {
      // Mantém jogadores no pódio — reset só quando admin encerra a sala
      set((s) => (s.finalResult ? { screen: 'final_ranking' as const } : {}));
    } else if (data.status === 'inativo') {
      // Limpa tudo — próxima partida exige entrada do zero
      clearLastJoinInfo();
      set({
        screen: 'entry',
        joinPending: false,
        playerInfo: null,
        question: null,
        questionNumber: 0,
        questionResult: null,
        finalResult: null,
        timer: 0,
        currentScore: 0,
        currentPosition: null,
        lastPointsGained: 0,
        lastPositionChange: null,
        musicEnabledByAdmin: false,
        quizTitle: null,
        quizImageUrl: null,
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
    // Captura os valores ANTES de sobrescrever — é a diferença entre o
    // score/posição anteriores e os novos que dá os deltas da rodada.
    const { currentScore: prevScore, currentPosition: prevPosition } = get();

    set({
      questionResult: {
        correctIndex: data.correctIndex,
        top5: data.top5,
        you: data.you,
      },
      currentScore: data.you.score,
      currentPosition: data.you.position,
      lastPointsGained: data.you.score - prevScore,
      lastPositionChange: prevPosition != null ? prevPosition - data.you.position : null,
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
      gameStatus: 'inativo',
      joinPending: false,
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
      lastPointsGained: 0,
      lastPositionChange: null,
      musicEnabledByAdmin: false,
      quizTitle: null,
      quizImageUrl: null,
    }),
}));