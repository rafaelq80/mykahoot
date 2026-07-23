import { IsIn, IsOptional, IsUUID } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Quiz } from '../../quiz/entities/quiz.entity';
import { PlayerResult } from './player-result.entity';

export const GAME_SESSION_STATUSES = [
  'em_andamento',
  'finalizado',
  'interrompida',
] as const;

export type GameSessionStatus = (typeof GAME_SESSION_STATUSES)[number];

@Entity('GameSession')
export class GameSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  @IsUUID()
  @IsOptional()
  quizId!: string | null;

  @Column({ type: 'varchar', default: 'em_andamento' })
  @IsIn(GAME_SESSION_STATUSES)
  status!: GameSessionStatus;

  @CreateDateColumn({ type: 'timestamp' })
  playedAt!: Date;

  @ManyToOne(() => Quiz, (quiz) => quiz.sessions, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'quizId' })
  @IsOptional()
  quiz?: Quiz | null;

  @OneToMany(() => PlayerResult, (result) => result.session)
  @IsOptional()
  results?: PlayerResult[];
}
