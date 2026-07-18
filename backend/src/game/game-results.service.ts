import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSession } from './entities/game-session.entity';


@Injectable()
export class GameResultsService implements OnModuleInit {
  private readonly logger = new Logger(GameResultsService.name);

  constructor(
    @InjectRepository(GameSession)
    private readonly gameSessionRepository: Repository<GameSession>,
  ) {}

  async onModuleInit(): Promise<void> {
    const result = await this.gameSessionRepository.update(
      { status: 'em_andamento' },
      { status: 'interrompida' },
    );
    const count = result.affected ?? 0;
    if (count > 0) {
      this.logger.warn(
        `${count} sessão(ões) em_andamento encontradas ao iniciar — marcadas como interrompidas.`,
      );
    }
  }

  async finalizarSessao(gameSessionId: string): Promise<void> {
    try {
      await this.gameSessionRepository.update(
        { id: gameSessionId },
        { status: 'finalizado' },
      );
      this.logger.log(`GameSession ${gameSessionId} finalizada.`);
    } catch (err) {
      this.logger.error(`Erro ao finalizar GameSession ${gameSessionId}`, err);
      throw err;
    }
  }
}
