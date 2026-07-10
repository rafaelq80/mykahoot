import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  themeId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;
}
