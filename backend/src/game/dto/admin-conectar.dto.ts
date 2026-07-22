import { IsOptional, IsString } from 'class-validator';

export class AdminConectarDto {
  @IsString()
  @IsOptional()
  token?: string;
}
