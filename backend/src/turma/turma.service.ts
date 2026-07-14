import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTurmaDto } from './dto/create-turma.dto.js';
import { UpdateTurmaDto } from './dto/update-turma.dto.js';
import { CreateAlunoDto } from './dto/create-aluno.dto.js';
import { UpdateAlunoDto } from './dto/update-aluno.dto.js';

@Injectable()
export class TurmaService {
  private readonly logger = new Logger(TurmaService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Turmas ──────────────────────────────────────────────────────────────

  async findAllTurmas() {
    this.logger.log('Finding all turmas');
    return this.prisma.turma.findMany({
      orderBy: { nome: 'asc' },
      include: { alunos: { orderBy: { nome: 'asc' } } },
    });
  }

  async findOneTurma(id: string) {
    const turma = await this.prisma.turma.findUnique({
      where: { id },
      include: { alunos: { orderBy: { nome: 'asc' } } },
    });
    if (!turma) {
      throw new NotFoundException(`Turma with id "${id}" not found`);
    }
    return turma;
  }

  async createTurma(dto: CreateTurmaDto) {
    this.logger.log(`Creating turma: ${dto.nome}`);
    return this.prisma.turma.create({ data: dto });
  }

  async updateTurma(id: string, dto: UpdateTurmaDto) {
    await this.findOneTurma(id);
    this.logger.log(`Updating turma: ${id}`);
    return this.prisma.turma.update({ where: { id }, data: dto });
  }

  async removeTurma(id: string) {
    await this.findOneTurma(id);
    this.logger.log(`Removing turma: ${id}`);
    return this.prisma.turma.delete({ where: { id } });
  }

  // ── Alunos ──────────────────────────────────────────────────────────────

  async findAllAlunos(turmaId: string) {
    await this.findOneTurma(turmaId);
    return this.prisma.aluno.findMany({
      where: { turmaId },
      orderBy: { nome: 'asc' },
    });
  }

  async createAluno(turmaId: string, dto: CreateAlunoDto) {
    await this.findOneTurma(turmaId);
    this.logger.log(`Creating aluno "${dto.nome}" in turma ${turmaId}`);
    return this.prisma.aluno.create({ data: { ...dto, turmaId } });
  }

  async updateAluno(turmaId: string, alunoId: string, dto: UpdateAlunoDto) {
    const aluno = await this.prisma.aluno.findUnique({ where: { id: alunoId } });
    if (!aluno || aluno.turmaId !== turmaId) {
      throw new NotFoundException(
        `Aluno with id "${alunoId}" not found in turma "${turmaId}"`,
      );
    }
    this.logger.log(`Updating aluno: ${alunoId}`);
    return this.prisma.aluno.update({ where: { id: alunoId }, data: dto });
  }

  async removeAluno(turmaId: string, alunoId: string) {
    const aluno = await this.prisma.aluno.findUnique({ where: { id: alunoId } });
    if (!aluno || aluno.turmaId !== turmaId) {
      throw new NotFoundException(
        `Aluno with id "${alunoId}" not found in turma "${turmaId}"`,
      );
    }
    this.logger.log(`Removing aluno: ${alunoId}`);
    return this.prisma.aluno.delete({ where: { id: alunoId } });
  }
}
