import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  themeId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;
}
