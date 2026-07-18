import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '../admin/admin.module';
import { Theme } from './entities/theme.entity';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';


@Module({
  imports: [TypeOrmModule.forFeature([Theme]), AdminModule],
  controllers: [ThemeController],
  providers: [ThemeService],
})
export class ThemeModule {}
