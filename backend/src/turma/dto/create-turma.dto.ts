import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTurmaDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;
}
