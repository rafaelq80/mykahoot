import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { Question } from './entities/question.entity';
import { Quiz } from './entities/quiz.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question]), AdminModule],
  controllers: [QuizController, QuestionController],
  providers: [QuizService, QuestionService],
  exports: [QuizService, QuestionService],
})
export class QuizModule {}
