import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../admin/jwt.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller('game/sessions')
@UseGuards(JwtAuthGuard)
export class GameSessionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    return this.prisma.gameSession.findMany({
      orderBy: { playedAt: 'desc' },
      include: {
        quiz: {
          select: {
            title: true,
            theme: { select: { name: true } },
          },
        },
        results: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            score: true,
          },
          orderBy: { score: 'desc' },
        },
      },
    });
  }
}
