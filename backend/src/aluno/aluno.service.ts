import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TurmaService } from '../turma/turma.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { Aluno } from './entities/aluno.entity';

@Injectable()
export class AlunoService {
  private readonly logger = new Logger(AlunoService.name);

  constructor(
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
    private readonly turmaService: TurmaService,
  ) {}

  async findAllAlunos(turmaId: string): Promise<Aluno[]> {
    await this.turmaService.findOneTurma(turmaId);
    return this.alunoRepository.find({
      where: { turmaId },
      order: { nome: 'ASC' },
    });
  }

  async createAluno(turmaId: string, dto: CreateAlunoDto): Promise<Aluno> {
    await this.turmaService.findOneTurma(turmaId);
    this.logger.log(`Creating aluno "${dto.nome}" in turma ${turmaId}`);
    const aluno = this.alunoRepository.create({ ...dto, turmaId });
    return this.alunoRepository.save(aluno);
  }

  async updateAluno(
    turmaId: string,
    alunoId: string,
    dto: UpdateAlunoDto,
  ): Promise<Aluno> {
    const aluno = await this.findAlunoInTurma(turmaId, alunoId);
    this.logger.log(`Updating aluno: ${alunoId}`);
    Object.assign(aluno, dto);
    return this.alunoRepository.save(aluno);
  }

  async removeAluno(turmaId: string, alunoId: string): Promise<Aluno> {
    const aluno = await this.findAlunoInTurma(turmaId, alunoId);
    this.logger.log(`Removing aluno: ${alunoId}`);
    return this.alunoRepository.remove(aluno);
  }

  /**
   * Confirma que o aluno existe E pertence à turma informada.
   * É o mesmo predicado usado pelo GameGateway para validar a entrada do
   * aluno na partida — mantido aqui como fonte única de verdade.
   */
  async findAlunoInTurma(turmaId: string, alunoId: string): Promise<Aluno> {
    const aluno = await this.alunoRepository.findOne({
      where: { id: alunoId },
    });
    if (!aluno || aluno.turmaId !== turmaId) {
      throw new NotFoundException(
        `Aluno with id "${alunoId}" not found in turma "${turmaId}"`,
      );
    }
    return aluno;
  }
}