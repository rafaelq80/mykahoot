import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { Turma } from './entities/turma.entity';

@Injectable()
export class TurmaService {
  private readonly logger = new Logger(TurmaService.name);

  constructor(
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,
  ) {}

  async findAllTurmas(): Promise<Turma[]> {
    this.logger.log('Finding all turmas');
    return this.turmaRepository.find({
      relations: { alunos: true },
      order: { nome: 'ASC', alunos: { nome: 'ASC' } },
    });
  }

  async findOneTurma(id: string): Promise<Turma> {
    const turma = await this.turmaRepository.findOne({
      where: { id },
      relations: { alunos: true },
      order: { alunos: { nome: 'ASC' } },
    });
    if (!turma) {
      throw new NotFoundException(`Turma with id "${id}" not found`);
    }
    return turma;
  }

  async createTurma(dto: CreateTurmaDto): Promise<Turma> {
    this.logger.log(`Creating turma: ${dto.nome}`);
    const turma = this.turmaRepository.create(dto);
    return this.turmaRepository.save(turma);
  }

  async updateTurma(id: string, dto: UpdateTurmaDto): Promise<Turma> {
    const turma = await this.findOneTurma(id);
    this.logger.log(`Updating turma: ${id}`);
    Object.assign(turma, dto);
    return this.turmaRepository.save(turma);
  }

  async removeTurma(id: string): Promise<Turma> {
    const turma = await this.findOneTurma(id);
    this.logger.log(`Removing turma: ${id}`);
    return this.turmaRepository.remove(turma);
  }
}