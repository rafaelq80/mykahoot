import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Quiz } from '../../quiz/entities/quiz.entity';

@Entity('Theme')
export class Theme {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  @IsString()
  @IsOptional()
  description?: string | null;

  @OneToMany(() => Quiz, (quiz) => quiz.theme)
  @IsOptional()
  quizzes?: Quiz[];
}
