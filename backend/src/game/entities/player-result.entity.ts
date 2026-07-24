import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Turma } from '../../turma/entities/turma.entity';
import { GameSession } from './game-session.entity';
import { Aluno } from '../../aluno/entities/aluno.entity';

export interface PlayerAnswerRecord {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
  timeMs: number;
}

@Entity('PlayerResult')
export class PlayerResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  gameSessionId!: string;

  @ManyToOne(() => GameSession, (session) => session.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameSessionId' })
  @IsOptional()
  session?: GameSession;

  @Column({ type: 'varchar' })
  @IsString()
  @IsNotEmpty()
  nickname!: string;

  @Column({ type: 'varchar' })
  @IsString()
  @IsNotEmpty()
  avatar!: string;

  @Column({ type: 'int', default: 0 })
  @IsInt()
  @Min(0)
  score!: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  @IsArray()
  answers!: PlayerAnswerRecord[];

  @Column({ type: 'int', default: 0 })
  @IsInt()
  @Min(0)
  correctCount!: number;

  @Column({ type: 'int', default: 0 })
  @IsInt()
  @Min(0)
  wrongCount!: number;

  @Column({ type: 'int', nullable: true })
  @IsInt()
  @IsOptional()
  classificacao?: number | null;

  @Column({ type: 'uuid', nullable: true })
  @IsUUID()
  @IsOptional()
  turmaId?: string | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  @IsUUID()
  @IsOptional()
  alunoId?: string | null;

  @ManyToOne(() => Turma, (turma) => turma.resultados, {
    nullable: true,
  })
  @JoinColumn({ name: 'turmaId' })
  @IsOptional()
  turma?: Turma | null;

  @ManyToOne(() => Aluno, (aluno) => aluno.resultados, {
    nullable: true,
  })
  @JoinColumn({ name: 'alunoId' })
  @IsOptional()
  aluno?: Aluno | null;
}
