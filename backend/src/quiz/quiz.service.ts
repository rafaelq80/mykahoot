import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateQuizDto } from './dto/create-quiz.dto.js';
import { UpdateQuizDto } from './dto/update-quiz.dto.js';
import { CreateQuestionDto } from './dto/create-question.dto.js';
import { UpdateQuestionDto } from './dto/update-question.dto.js';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Quizzes ──────────────────────────────────────────────────────────────

  async findAllQuizzes() {
    this.logger.log('Finding all quizzes');
    return this.prisma.quiz.findMany({
      include: {
        theme: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { title: 'asc' },
    });
  }

  async findOneQuiz(id: string, includeAnswers = false) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        theme: { select: { id: true, name: true } },
        questions: { orderBy: { order: 'asc' } },
      },
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz with id "${id}" not found`);
    }
    if (!includeAnswers) {
      return {
        ...quiz,
        questions: quiz.questions.map(({ correctIndex: _c, ...q }) => q),
      };
    }
    return quiz;
  }

  async createQuiz(dto: CreateQuizDto) {
    this.logger.log(`Creating quiz: ${dto.title}`);
    return this.prisma.quiz.create({
      data: dto,
      include: {
        theme: { select: { id: true, name: true } },
      },
    });
  }

  async updateQuiz(id: string, dto: UpdateQuizDto) {
    await this.findOneQuiz(id);
    this.logger.log(`Updating quiz: ${id}`);
    return this.prisma.quiz.update({
      where: { id },
      data: dto,
      include: {
        theme: { select: { id: true, name: true } },
      },
    });
  }

  async removeQuiz(id: string) {
    await this.findOneQuiz(id);
    this.logger.log(`Removing quiz: ${id}`);
    return this.prisma.quiz.delete({ where: { id } });
  }

  // ── Questions ─────────────────────────────────────────────────────────────

  async findAllQuestions(quizId: string, includeAnswers = false) {
    await this.findOneQuiz(quizId, true);
    this.logger.log(`Finding all questions for quiz: ${quizId}`);
    const questions = await this.prisma.question.findMany({
      where: { quizId },
      orderBy: { order: 'asc' },
    });
    if (includeAnswers) return questions;
    return questions.map(({ correctIndex: _c, ...q }) => q);
  }

  async createQuestion(quizId: string, dto: CreateQuestionDto) {
    await this.findOneQuiz(quizId);
    this.logger.log(`Creating question for quiz: ${quizId}`);
    return this.prisma.question.create({
      data: { ...dto, quizId },
    });
  }

  async updateQuestion(quizId: string, questionId: string, dto: UpdateQuestionDto) {
    await this.findOneQuestion(quizId, questionId);
    this.logger.log(`Updating question: ${questionId}`);
    return this.prisma.question.update({
      where: { id: questionId },
      data: dto,
    });
  }

  async removeQuestion(quizId: string, questionId: string) {
    await this.findOneQuestion(quizId, questionId);
    this.logger.log(`Removing question: ${questionId}`);
    return this.prisma.question.delete({ where: { id: questionId } });
  }

  private async findOneQuestion(quizId: string, questionId: string) {
    const question = await this.prisma.question.findFirst({
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
