import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from './config/env.validation';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { GameHistoryModule } from './game-history/game-history.module';
import { GameModule } from './game/game.module';
import { MediaModule } from './media/media.module';
import { QuizModule } from './quiz/quiz.module';
import { ThemeModule } from './theme/theme.module';
import { TurmaModule } from './turma/turma.module';
import { AlunoModule } from './aluno/aluno.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 10_000, limit: 20 }]),
    DatabaseModule,
    ThemeModule,
    QuizModule,
    TurmaModule,
    AdminModule,
    GameModule,
    GameHistoryModule,
    AlunoModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
