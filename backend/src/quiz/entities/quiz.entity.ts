import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GameSession } from '../../game/entities/game-session.entity';
import { Theme } from '../../theme/entities/theme.entity';
import { Question } from './question.entity';

@Entity('Quiz')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  themeId!: string;

  @ManyToOne(() => Theme, (theme) => theme.quizzes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'themeId' })
  @IsOptional()
  theme?: Theme;

  @Column({ type: 'varchar' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  questionCount?: number;

  @OneToMany(() => Question, (question) => question.quiz)
  @IsOptional()
  questions?: Question[];

  @OneToMany(() => GameSession, (session) => session.quiz)
  @IsOptional()
  sessions?: GameSession[];
}
