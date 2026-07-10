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
} from '@nestjs/common';
import { QuizService } from './quiz.service.js';
import { CreateQuizDto } from './dto/create-quiz.dto.js';
import { UpdateQuizDto } from './dto/update-quiz.dto.js';
import { CreateQuestionDto } from './dto/create-question.dto.js';
import { UpdateQuestionDto } from './dto/update-question.dto.js';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // ── Quizzes ──────────────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.quizService.findAllQuizzes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOneQuiz(id);
  }

  @Post()
  create(@Body() dto: CreateQuizDto) {
    return this.quizService.createQuiz(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return this.quizService.updateQuiz(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.quizService.removeQuiz(id);
  }

  // ── Questions ─────────────────────────────────────────────────────────────

  @Get(':id/questions')
  findAllQuestions(@Param('id') quizId: string) {
    return this.quizService.findAllQuestions(quizId);
  }

  @Post(':id/questions')
  createQuestion(
    @Param('id') quizId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.quizService.createQuestion(quizId, dto);
  }

  @Patch(':quizId/questions/:questionId')
  updateQuestion(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.quizService.updateQuestion(quizId, questionId, dto);
  }

  @Delete(':quizId/questions/:questionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeQuestion(
    @Param('quizId') quizId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.quizService.removeQuestion(quizId, questionId);
  }
}
