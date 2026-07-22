import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { Turma } from './entities/turma.entity';
import { TurmaController } from './turma.controller';
import { TurmaService } from './turma.service';

@Module({
  imports: [TypeOrmModule.forFeature([Turma]), AdminModule],
  controllers: [TurmaController],
  providers: [TurmaService],
  exports: [TurmaService],
})
export class TurmaModule {}
