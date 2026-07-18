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
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { AlunoService } from './aluno.service';

// Aninhado sob /turmas para preservar as rotas originais, mas vive em seu
// próprio módulo. Leituras públicas, mutações exigem o professor logado.
@Controller('turmas/:turmaId/alunos')
export class AlunoController {
  constructor(private readonly alunoService: AlunoService) {}

  @Get()
  findAll(@Param('turmaId') turmaId: string) {
    return this.alunoService.findAllAlunos(turmaId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Param('turmaId') turmaId: string, @Body() dto: CreateAlunoDto) {
    return this.alunoService.createAluno(turmaId, dto);
  }

  @Patch(':alunoId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('turmaId') turmaId: string,
    @Param('alunoId') alunoId: string,
    @Body() dto: UpdateAlunoDto,
  ) {
    return this.alunoService.updateAluno(turmaId, alunoId, dto);
  }

  @Delete(':alunoId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('turmaId') turmaId: string,
    @Param('alunoId') alunoId: string,
  ) {
    return this.alunoService.removeAluno(turmaId, alunoId);
  }
}