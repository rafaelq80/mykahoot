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
} from '@nestjs/common';
import { CreateThemeDto } from './dto/create-theme.dto.js';
import { UpdateThemeDto } from './dto/update-theme.dto.js';
import { ThemeService } from './theme.service.js';

@Controller('themes')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get()
  findAll() {
    return this.themeService.findAll();
  }

  @Post()
  create(@Body() dto: CreateThemeDto) {
    return this.themeService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateThemeDto) {
    return this.themeService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.themeService.remove(id);
  }
}
