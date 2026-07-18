import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerResult } from '../../game/entities/player-result.entity';
import { Aluno } from '../../aluno/entities/aluno.entity';

@Entity('Turma')
export class Turma {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @OneToMany(() => Aluno, (aluno) => aluno.turma)
  @IsOptional()
  alunos?: Aluno[];

  @OneToMany(() => PlayerResult, (result) => result.turma)
  @IsOptional()
  resultados?: PlayerResult[];
}