import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAlunoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;
}
