import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Admin')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  @IsString()
  @IsNotEmpty()
  username!: string;

  // Nunca deve ser serializado de volta ao cliente.
  @Column({ type: 'varchar' })
  @Exclude({ toPlainOnly: true })
  @IsString()
  @MinLength(6)
  passwordHash!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
