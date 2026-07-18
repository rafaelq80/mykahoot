import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { Theme } from './entities/theme.entity';


@Injectable()
export class ThemeService {
  private readonly logger = new Logger(ThemeService.name);

  constructor(
    @InjectRepository(Theme)
    private readonly themeRepository: Repository<Theme>,
  ) {}

  async findAll(): Promise<Theme[]> {
    this.logger.log('Finding all themes');
    return this.themeRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Theme> {
    const theme = await this.themeRepository.findOne({ where: { id } });
    if (!theme) {
      throw new NotFoundException(`Theme with id "${id}" not found`);
    }
    return theme;
  }

  async create(dto: CreateThemeDto): Promise<Theme> {
    this.logger.log(`Creating theme: ${dto.name}`);
    const theme = this.themeRepository.create(dto);
    return this.themeRepository.save(theme);
  }

  async update(id: string, dto: UpdateThemeDto): Promise<Theme> {
    const theme = await this.findOne(id);
    this.logger.log(`Updating theme: ${id}`);
    Object.assign(theme, dto);
    return this.themeRepository.save(theme);
  }

  async remove(id: string): Promise<Theme> {
    const theme = await this.findOne(id);
    this.logger.log(`Removing theme: ${id}`);
    return this.themeRepository.remove(theme);
  }
}
