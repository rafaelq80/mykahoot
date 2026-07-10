import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AdminModule } from './admin/admin.module.js';
import { GameModule } from './game/game.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { QuizModule } from './quiz/quiz.module.js';
import { ThemeModule } from './theme/theme.module.js';

@Module({
  imports: [PrismaModule, ThemeModule, QuizModule, AdminModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
