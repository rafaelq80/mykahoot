import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class ResponderDto {
  @IsUUID()
  questionId!: string;

  @IsInt()
  @Min(0)
  @Max(3)
  selectedIndex!: number;
}
