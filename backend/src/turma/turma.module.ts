import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TurmaController } from './turma.controller.js';
import { TurmaService } from './turma.service.js';

@Module({
  imports: [PrismaModule, AdminModule],
  controllers: [TurmaController],
  providers: [TurmaService],
  exports: [TurmaService],
})
export class TurmaModule {}
