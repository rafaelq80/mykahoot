import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Question } from './entities/question.entity';
import { Quiz } from './entities/quiz.entity';


@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  /** Remove o gabarito antes de enviar perguntas para quem não é admin. */
  private static stripCorrectIndex(
    question: Question,
  ): Omit<Question, 'correctIndex'> {
    const clone: Partial<Question> = { ...question };
    delete clone.correctIndex;
    return clone as Omit<Question, 'correctIndex'>;
  }

  // ── Quizzes ──────────────────────────────────────────────────────────────

  async findAllQuizzes(): Promise<(Quiz & { _count: { questions: number } })[]> {
    this.logger.log('Finding all quizzes');
    // getRawAndEntities (em vez de getMany) é o que garante que o campo
    // bruto da subquery (quiz_questionCount) chegue até nós — getMany()
    // descarta silenciosamente qualquer coluna selecionada que não
    // corresponda a uma propriedade mapeada da entidade.
    const { entities, raw } = await this.quizRepository
      .createQueryBuilder('quiz')
      .leftJoin('quiz.theme', 'theme')
      .addSelect(['theme.id', 'theme.name'])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(question.id)', 'count')
          .from(Question, 'question')
          .where('question.quizId = quiz.id');
      }, 'quiz_questionCount')
      .orderBy('quiz.title', 'ASC')
      .getRawAndEntities();

    return entities.map((quiz: Quiz, index: number) => ({
      ...quiz,
      _count: { questions: Number(raw[index]?.quiz_questionCount ?? 0) },
    }));
  }

  async findOneQuiz(id: string, includeAnswers = false): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: { theme: true, questions: true },
      order: { questions: { order: 'ASC' } },
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz with id "${id}" not found`);
    }
    if (!includeAnswers) {
      return {
        ...quiz,
        questions: (quiz.questions ?? []).map((q) =>
          QuizService.stripCorrectIndex(q),
        ) as Question[],
      };
    }
    return quiz;
  }

  async createQuiz(dto: CreateQuizDto): Promise<Quiz> {
    this.logger.log(`Creating quiz: ${dto.title}`);
    const quiz = this.quizRepository.create(dto);
    const saved = await this.quizRepository.save(quiz);
    return this.quizRepository.findOneOrFail({
      where: { id: saved.id },
      relations: { theme: true },
    });
  }

  async updateQuiz(id: string, dto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findOneQuiz(id, true);
    this.logger.log(`Updating quiz: ${id}`);
    Object.assign(quiz, dto);
    await this.quizRepository.save(quiz);
    return this.quizRepository.findOneOrFail({
      where: { id },
      relations: { theme: true },
    });
  }

  async removeQuiz(id: string): Promise<Quiz> {
    const quiz = await this.findOneQuiz(id, true);
    this.logger.log(`Removing quiz: ${id}`);
    return this.quizRepository.remove(quiz);
  }

  // ── Questions ─────────────────────────────────────────────────────────────

  async findAllQuestions(
    quizId: string,
    includeAnswers = false,
  ): Promise<Partial<Question>[]> {
    await this.findOneQuiz(quizId, true);
    this.logger.log(`Finding all questions for quiz: ${quizId}`);
    const questions = await this.questionRepository.find({
      where: { quizId },
      order: { order: 'ASC' },
    });
    if (includeAnswers) return questions;
    return questions.map((q) => QuizService.stripCorrectIndex(q));
  }

  async createQuestion(
    quizId: string,
    dto: CreateQuestionDto,
  ): Promise<Question> {
    await this.findOneQuiz(quizId, true);
    this.logger.log(`Creating question for quiz: ${quizId}`);
    const question = this.questionRepository.create({ ...dto, quizId });
    return this.questionRepository.save(question);
  }

  async updateQuestion(
    quizId: string,
    questionId: string,
    dto: UpdateQuestionDto,
  ): Promise<Question> {
    const question = await this.findOneQuestion(quizId, questionId);
    this.logger.log(`Updating question: ${questionId}`);
    Object.assign(question, dto);
    return this.questionRepository.save(question);
  }

  async removeQuestion(quizId: string, questionId: string): Promise<Question> {
    const question = await this.findOneQuestion(quizId, questionId);
    this.logger.log(`Removing question: ${questionId}`);
    return this.questionRepository.remove(question);
  }

  private async findOneQuestion(
    quizId: string,
    questionId: string,
  ): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId, quizId },
    });
    if (!question) {
      throw new NotFoundException(
        `Question with id "${questionId}" not found in quiz "${quizId}"`,
      );
    }
    return question;
  }
}