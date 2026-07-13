import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../admin/jwt.guard.js';
import { OptionalJwtAuthGuard } from '../admin/optional-jwt.guard.js';
import { QuizService } from './quiz.service.js';
import { CreateQuizDto } from './dto/create-quiz.dto.js';
import { UpdateQuizDto } from './dto/update-quiz.dto.js';
import { CreateQuestionDto } from './dto/create-question.dto.js';
import { UpdateQuestionDto } from './dto/update-question.dto.js';

interface AuthRequest extends Request {
  user?: { role: string };
}

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // ── Quizzes ──────────────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.quizService.findAllQuizzes();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.quizService.findOneQuiz(id, req.user?.role === 'admin');
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateQuizDto) {
    return this.quizService.createQuiz(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return this.quizService.updateQuiz(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.quizService.removeQuiz(id);
  }

  // ── Questions ─────────────────────────────────────────────────────────────

  @Get(':id/questions')
  @UseGuards(OptionalJwtAuthGuard)
  findAllQuestions(@Param('id') quizId: string, @Req() req: AuthRequest) {
    return this.quizService.findAllQuestions(
      quizId,
      req.user?.role === 'admin',
    );
  }

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard)
  createQuestion(
    @Param('id') quizId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizService.createQuestion(quizId, dto);
  }

  @Patch(':quizId/questions/:questionId')
  @UseGuards(JwtAuthGuard)
  updateQuestion(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.quizService.updateQuestion(quizId, questionId, dto);
  }

  @Delete(':quizId/questions/:questionId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeQuestion(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.quizService.removeQuestion(quizId, questionId);
  }
}
