import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { Question } from './entities/question.entity';
import { Quiz } from './entities/quiz.entity';
import { ImageKitController } from './imagekit.controller';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question]), AdminModule],
  controllers: [QuizController, ImageKitController],
  providers: [QuizService],
})
export class QuizModule {}
