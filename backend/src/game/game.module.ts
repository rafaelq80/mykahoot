import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { GameStateService } from './game-state.service.js';
import { GameGateway } from './game.gateway.js';
import { GameResultsService } from './game-results.service.js';
import { GameSessionsController } from './game-sessions.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [GameSessionsController],
  providers: [GameStateService, GameGateway, GameResultsService],
  exports: [GameStateService, GameResultsService],
})
export class GameModule {}
