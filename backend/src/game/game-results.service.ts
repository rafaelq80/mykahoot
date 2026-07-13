import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class GameResultsService implements OnModuleInit {
  private readonly logger = new Logger(GameResultsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    const interrompidas = await this.prisma.withRetry(() =>
      this.prisma.gameSession.updateMany({
        where: { status: 'em_andamento' },
        data: { status: 'interrompida' },
      }),
    );
    if (interrompidas.count > 0) {
      this.logger.warn(
        `${interrompidas.count} sessão(ões) em_andamento encontradas ao iniciar — marcadas como interrompidas.`,
      );
    }
  }

  async finalizarSessao(gameSessionId: string): Promise<void> {
    try {
      await this.prisma.gameSession.update({
        where: { id: gameSessionId },
        data: { status: 'finalizado' },
      });
      this.logger.log(`GameSession ${gameSessionId} finalizada.`);
    } catch (err) {
      this.logger.error(`Erro ao finalizar GameSession ${gameSessionId}`, err);
      throw err;
    }
  }
}
