import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { GameSession } from '../game/entities/game-session.entity';
import { PlayerResult } from '../game/entities/player-result.entity';
import { GameHistoryController } from './game-history.controller';
import { GameHistoryService } from './game-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameSession, PlayerResult]),
    AdminModule,
  ],
  controllers: [GameHistoryController],
  providers: [GameHistoryService],
  exports: [GameHistoryService],
})
export class GameHistoryModule {}
