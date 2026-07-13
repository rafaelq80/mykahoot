import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { QuizController } from './quiz.controller.js';
import { QuizService } from './quiz.service.js';
import { ImageKitController } from './imagekit.controller.js';

@Module({
  imports: [PrismaModule, AdminModule],
  controllers: [QuizController, ImageKitController],
  providers: [QuizService],
})
export class QuizModule {}
