import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ThemeController } from './theme.controller.js';
import { ThemeService } from './theme.service.js';

@Module({
  imports: [PrismaModule, AdminModule],
  controllers: [ThemeController],
  providers: [ThemeService],
})
export class ThemeModule {}
