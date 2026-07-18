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
import { JwtAuthGuard } from '../admin/jwt.guard';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { TurmaService } from './turma.service';

// Leituras públicas (mesma abordagem de /themes e /quizzes) — a tela de
// ingresso dos players precisa ler turmas sem estar autenticada como admin.
// Mutações exigem o professor logado. Rotas de aluno vivem em AlunoModule.
@Controller('turmas')
export class TurmaController {
  constructor(private readonly turmaService: TurmaService) {}

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
}