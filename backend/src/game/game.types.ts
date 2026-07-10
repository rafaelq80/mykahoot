export type GameStatus =
  | 'inativo'
  | 'lobby'
  | 'pergunta_ativa'
  | 'mostrando_resultado'
  | 'finalizado';

export interface PlayerState {
  socketId: string;
  /** id do PlayerResult já criado no Neon para este jogador */
  playerResultId: string;
  nickname: string;
  avatar: string;
  score: number;
  /** questionId → resposta registrada */
  answers: Map<string, { selectedIndex: number; timeMs: number; correct: boolean }>;
}

export interface GameState {
  status: GameStatus;
  /** id da GameSession criada no Neon ao abrir a sala */
  gameSessionId: string | null;
  quizId: string | null;
  currentQuestionIndex: number;
  /** timestamp usado para calcular timeMs da resposta */
  questionStartedAt: number | null;
  /** dispara mostrarResultado automaticamente ao fim do timeLimitSec */
  questionTimer: NodeJS.Timeout | null;
  /** socketId → player */
  players: Map<string, PlayerState>;
}

/** Subconjunto de Question (Prisma) necessário para cálculo de resultado */
export interface QuestionShape {
  id: string;
  correctIndex: number;
  timeLimitSec: number;
}

export interface RankingEntry {
  socketId: string;
  nickname: string;
  avatar: string;
  score: number;
  correct: boolean;
  selectedIndex: number;
  pointsEarned: number;
}
