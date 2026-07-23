import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../admin/jwt.guard';
import { GameSession } from '../game/entities/game-session.entity';

@Controller('game/sessions')
@UseGuards(JwtAuthGuard)
export class GameHistoryController {
  constructor(
    @InjectRepository(GameSession)
    private readonly gameSessionRepository: Repository<GameSession>,
  ) {}

  @Get()
  async findAll(): Promise<GameSession[]> {
    return this.gameSessionRepository.find({
      order: { playedAt: 'DESC', results: { score: 'DESC' } },
      relations: { quiz: { theme: true }, results: true },
      select: {
        id: true,
        status: true,
        playedAt: true,
        quizId: true,
        quiz: { title: true, theme: { name: true } },
        results: { id: true, nickname: true, avatar: true, score: true },
      },
    });
  }
}
