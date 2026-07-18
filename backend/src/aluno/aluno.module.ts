import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { TurmaModule } from '../turma/turma.module';
import { Aluno } from './entities/aluno.entity';
import { AlunoController } from './aluno.controller';
import { AlunoService } from './aluno.service';

@Module({
  imports: [TypeOrmModule.forFeature([Aluno]), AdminModule, TurmaModule],
  controllers: [AlunoController],
  providers: [AlunoService],
  exports: [AlunoService],
})
export class AlunoModule {}