import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * Payload de 'player:entrar'. O nickname NÃO é mais enviado pelo cliente:
 * o aluno escolhe a si mesmo (alunoId) dentro da turma selecionada, e o
 * servidor usa o nome cadastrado no roster (Aluno.nome) como nickname —
 * isso é o que garante que só é possível entrar como um aluno que
 * realmente pertence à turma.
 */
export class EntrarDto {
  @IsUUID()
  turmaId!: string;

  @IsUUID()
  alunoId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  avatar!: string;
}
