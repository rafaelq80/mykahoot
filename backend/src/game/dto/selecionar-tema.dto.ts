import { IsUUID } from 'class-validator';

export class SelecionarTemaDto {
  @IsUUID()
  quizId!: string;
}
