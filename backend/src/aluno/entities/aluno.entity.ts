import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlayerResult } from '../../game/entities/player-result.entity';
import { Turma } from '../../turma/entities/turma.entity';

@Entity('Aluno')
export class Aluno {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  turmaId!: string;

  @Column({ type: 'varchar' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ManyToOne(() => Turma, (turma) => turma.alunos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'turmaId' })
  turma?: Turma;

  @OneToMany(() => PlayerResult, (result) => result.aluno)
  @IsOptional()
  resultados?: PlayerResult[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
