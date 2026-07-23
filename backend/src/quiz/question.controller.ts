import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../admin/jwt.guard';
import { OptionalJwtAuthGuard } from '../admin/optional-jwt.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionService } from './question.service';

interface AuthRequest extends Request {
  user?: { role: string };
}

@Controller('quizzes/:quizId/questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Req() req: AuthRequest,
  ) {
    return this.questionService.findAllQuestions(
      quizId,
      req.user?.role === 'admin',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionService.createQuestion(quizId, dto);
  }

  @Patch(':questionId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionService.updateQuestion(quizId, questionId, dto);
  }

  @Delete(':questionId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
  ) {
    return this.questionService.removeQuestion(quizId, questionId);
  }
}
