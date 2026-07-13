export type MusicPhase =
  | 'idle'
  | 'lobby'
  | 'question'
  | 'result'
  | 'podium';

export const TRACKS: Record<Exclude<MusicPhase, 'idle'>, string> = {
  lobby: '/audio/lobby-ambient.mp3',
  question: '/audio/question-tension.mp3',
  result: '/audio/lobby-ambient.mp3',
  podium: '/audio/podium-celebration.mp3',
};

export const STINGS = {
  correct: '/audio/correct-sting.mp3',
  wrong: '/audio/wrong-sting.mp3',
} as const;

export const FADE_MS = 400;
