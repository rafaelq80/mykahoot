import 'dotenv/config';
import 'reflect-metadata';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { Theme } from '../theme/entities/theme.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Question } from '../quiz/entities/question.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { GameSession } from '../game/entities/game-session.entity';
import { PlayerResult } from '../game/entities/player-result.entity';
import { Admin } from '../admin/entities/admin.entity';

export const ENTITIES = [
  Admin,
  Theme,
  Quiz,
  Question,
  Turma,
  Aluno,
  GameSession,
  PlayerResult,
];

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,

  entities: ENTITIES,

  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],

  synchronize: false,

  ssl: {
    rejectUnauthorized: false,
  },
});

export default AppDataSource;
