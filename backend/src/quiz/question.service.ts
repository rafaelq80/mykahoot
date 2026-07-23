import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';
import { QuizService } from './quiz.service';
import { stripCorrectIndex } from './quiz.utils';

@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);

  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly quizService: QuizService,
  ) {}

  async findAllQuestions(
    quizId: string,
    includeAnswers = false,
  ): Promise<Partial<Question>[]> {
    await this.quizService.findOneQuiz(quizId, true);
    this.logger.log(`Finding all questions for quiz: ${quizId}`);
    const questions = await this.questionRepository.find({
      where: { quizId },
      order: { order: 'ASC' },
    });
    if (includeAnswers) return questions;
    return questions.map((q) => stripCorrectIndex(q));
  }

  async createQuestion(
    quizId: string,
    dto: CreateQuestionDto,
  ): Promise<Question> {
    await this.quizService.findOneQuiz(quizId, true);
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

  async findOneQuestion(
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
