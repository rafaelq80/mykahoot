// WebSocket event payload types — keep in sync with backend game.gateway.ts

export interface GameEstadoEvent {
  status: string;
  playerCount: number;
}

export interface GamePerguntaEvent {
  questionId: string;
  text: string;
  imageUrl: string | null;
  options: string[];
  timeLimitSec: number;
}

export interface Top5Entry {
  nickname: string;
  avatar: string;
  score: number;
}

export interface GameResultadoPerguntaEvent {
  correctIndex: number;
  top5: Top5Entry[];
  you: {
    correct: boolean;
    selectedIndex: number;
    score: number;
    position: number;
  };
}

export interface GameFimEvent {
  top5: Top5Entry[];
  you: {
    score: number;
    position: number;
  };
}

export interface GameErroEvent {
  message: string;
}

// Admin events
export interface AdminEstadoPlayer {
  nickname: string;
  avatar: string;
  socketId: string;
}

export interface AdminEstadoEvent {
  status: string;
  players: AdminEstadoPlayer[];
  currentQuestionIndex: number;
}

export interface AdminPlacarEntry {
  socketId: string;
  nickname: string;
  avatar: string;
  score: number;
  correct: boolean;
  selectedIndex: number;
}

export interface AdminPlacarEvent {
  correctIndex: number;
  ranking: AdminPlacarEntry[];
}

export interface AdminFimEntry {
  nickname: string;
  avatar: string;
  score: number;
}

export interface AdminFimEvent {
  ranking: AdminFimEntry[];
}
