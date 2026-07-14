import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../admin/jwt.guard.js';
import { TurmaService } from './turma.service.js';
import { CreateTurmaDto } from './dto/create-turma.dto.js';
import { UpdateTurmaDto } from './dto/update-turma.dto.js';
import { CreateAlunoDto } from './dto/create-aluno.dto.js';
import { UpdateAlunoDto } from './dto/update-aluno.dto.js';

// Leituras públicas (mesma abordagem de /themes e /quizzes) — a tela de
// ingresso dos players precisa ler turmas/alunos sem estar autenticada
// como admin. Mutações exigem o professor logado.
@Controller('turmas')
export class TurmaController {
  constructor(private readonly turmaService: TurmaService) {}

  // ── Turmas ──────────────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.turmaService.findAllTurmas();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.turmaService.findOneTurma(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateTurmaDto) {
    return this.turmaService.createTurma(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTurmaDto) {
    return this.turmaService.updateTurma(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.turmaService.removeTurma(id);
  }

  // ── Alunos ──────────────────────────────────────────────────────────────

  @Get(':id/alunos')
  findAllAlunos(@Param('id') turmaId: string) {
    return this.turmaService.findAllAlunos(turmaId);
  }

  @Post(':id/alunos')
  @UseGuards(JwtAuthGuard)
  createAluno(@Param('id') turmaId: string, @Body() dto: CreateAlunoDto) {
    return this.turmaService.createAluno(turmaId, dto);
  }

  @Patch(':turmaId/alunos/:alunoId')
  @UseGuards(JwtAuthGuard)
  updateAluno(
    @Param('turmaId') turmaId: string,
    @Param('alunoId') alunoId: string,
    @Body() dto: UpdateAlunoDto,
  ) {
    return this.turmaService.updateAluno(turmaId, alunoId, dto);
  }

  @Delete(':turmaId/alunos/:alunoId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAluno(
    @Param('turmaId') turmaId: string,
    @Param('alunoId') alunoId: string,
  ) {
    return this.turmaService.removeAluno(turmaId, alunoId);
  }
}
