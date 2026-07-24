/** Canonical domain interfaces for Quiz, Question, and Theme. */

export interface Theme {
  id: string;
  name: string;
  description?: string;
}

export interface Quiz {
  id: string;
  title: string;
  themeId: string;
  imageUrl: string | null;
  theme: { name: string };
  _count: { questions: number };
}

/** Subset of Quiz used when editing (no theme/count join). */
export interface QuizDetail {
  id: string;
  title: string;
  themeId: string;
  imageUrl: string | null;
}

export interface Question {
  id: string;
  text: string;
  imageUrl: string | null;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
  order: number;
}

export interface CreateQuestionPayload {
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
  order: number;
  imageUrl: string | null;
}
