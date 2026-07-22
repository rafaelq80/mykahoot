import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Quiz } from './quiz.entity';

@Entity('Question')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @IsUUID()
  quizId!: string;

  @Column({ type: 'text' })
  @IsString()
  @IsNotEmpty()
  text!: string;

  @Column({ type: 'varchar', nullable: true })
  @IsString()
  @IsUrl()
  @IsOptional()
  imageUrl?: string | null;

  @Column({ type: 'jsonb' })
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  options!: string[];

  @Column({ type: 'int' })
  @IsInt()
  @Min(0)
  @Max(3)
  correctIndex!: number;

  @Column({ type: 'int', default: 20 })
  @IsInt()
  @Min(5)
  @Max(120)
  @IsOptional()
  timeLimitSec!: number;

  @Column({ type: 'int', name: 'order' })
  @IsInt()
  order!: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions)
  @JoinColumn({ name: 'quizId' })
  @IsOptional()
  quiz?: Quiz;
}
