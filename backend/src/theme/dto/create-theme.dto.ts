import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateThemeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
