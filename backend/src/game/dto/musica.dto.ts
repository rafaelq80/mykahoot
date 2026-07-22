import { IsBoolean } from 'class-validator';

export class MusicaDto {
  @IsBoolean()
  enabled!: boolean;
}
