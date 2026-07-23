import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Question } from './entities/question.entity';
import { Quiz } from './entities/quiz.entity';
import { stripCorrectIndex } from './quiz.utils';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
  ) {}

  async findAllQuizzes(): Promise<(Quiz & { _count: { questions: number } })[]> {
    this.logger.log('Finding all quizzes');
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
          stripCorrectIndex(q),
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
}
