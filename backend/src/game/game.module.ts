import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { Question } from '../quiz/entities/question.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { AlunoModule } from '../aluno/aluno.module';
import { GameSession } from './entities/game-session.entity';
import { PlayerResult } from './entities/player-result.entity';
import { GameResultsService } from './game-results.service';
import { GameSessionsController } from './game-sessions.controller';
import { GameStateService } from './game-state.service';
import { GameGateway } from './game.gateway';


@Module({
  imports: [
    TypeOrmModule.forFeature([GameSession, PlayerResult, Question, Quiz]),
    AdminModule,
    AlunoModule,
  ],
  controllers: [GameSessionsController],
  providers: [GameStateService, GameGateway, GameResultsService],
  exports: [GameStateService, GameResultsService],
})
export class GameModule {}