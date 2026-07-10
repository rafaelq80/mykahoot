import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateThemeDto } from './dto/create-theme.dto.js';
import { UpdateThemeDto } from './dto/update-theme.dto.js';

@Injectable()
export class ThemeService {
  private readonly logger = new Logger(ThemeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    this.logger.log('Finding all themes');
    return this.prisma.theme.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const theme = await this.prisma.theme.findUnique({ where: { id } });
    if (!theme) {
      throw new NotFoundException(`Theme with id "${id}" not found`);
    }
    return theme;
  }

  async create(dto: CreateThemeDto) {
    this.logger.log(`Creating theme: ${dto.name}`);
    return this.prisma.theme.create({ data: dto });
  }

  async update(id: string, dto: UpdateThemeDto) {
    await this.findOne(id);
    this.logger.log(`Updating theme: ${id}`);
    return this.prisma.theme.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    this.logger.log(`Removing theme: ${id}`);
    return this.prisma.theme.delete({ where: { id } });
  }
}
