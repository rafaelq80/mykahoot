import { Question } from './entities/question.entity';

/**
 * Remove o gabarito (correctIndex) antes de enviar perguntas para quem não é admin.
 * Shared entre QuizService (findOneQuiz com perguntas embutidas) e QuestionService.
 */
export function stripCorrectIndex(
  question: Question,
): Omit<Question, 'correctIndex'> {
  const clone: Partial<Question> = { ...question };
  delete clone.correctIndex;
  return clone as Omit<Question, 'correctIndex'>;
}
