import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../admin/jwt.guard';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { AlunoService } from './aluno.service';

@Controller('turmas/:turmaId/alunos')
export class AlunoController {
  constructor(private readonly alunoService: AlunoService) {}

  @Get()
  findAll(@Param('turmaId', ParseUUIDPipe) turmaId: string) {
    return this.alunoService.findAllAlunos(turmaId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Param('turmaId', ParseUUIDPipe) turmaId: string, @Body() dto: CreateAlunoDto) {
    return this.alunoService.createAluno(turmaId, dto);
  }

  @Patch(':alunoId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('turmaId', ParseUUIDPipe) turmaId: string,
    @Param('alunoId', ParseUUIDPipe) alunoId: string,
    @Body() dto: UpdateAlunoDto,
  ) {
    return this.alunoService.updateAluno(turmaId, alunoId, dto);
  }

  @Delete(':alunoId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('turmaId', ParseUUIDPipe) turmaId: string,
    @Param('alunoId', ParseUUIDPipe) alunoId: string,
  ) {
    return this.alunoService.removeAluno(turmaId, alunoId);
  }
}
