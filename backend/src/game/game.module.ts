import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { AlunoModule } from '../aluno/aluno.module';
import { GameHistoryModule } from '../game-history/game-history.module';
import { QuizModule } from '../quiz/quiz.module';
import { GameSession } from './entities/game-session.entity';
import { PlayerResult } from './entities/player-result.entity';
import { GameStateService } from './game-state.service';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameSession, PlayerResult]),
    AdminModule,
    AlunoModule,
    QuizModule,
    GameHistoryModule,
  ],
  providers: [GameStateService, GameGateway, GameService],
  exports: [GameStateService],
})
export class GameModule {}
