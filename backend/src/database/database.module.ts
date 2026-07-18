import { join } from 'node:path';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameSession } from '../game/entities/game-session.entity';
import { PlayerResult } from '../game/entities/player-result.entity';
import { Question } from '../quiz/entities/question.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Theme } from '../theme/entities/theme.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Admin } from '../admin/entities/admin.entity';
import { Aluno } from '../aluno/entities/aluno.entity';

const ENTITIES = [
  Admin,
  Theme,
  Quiz,
  Question,
  Turma,
  Aluno,
  GameSession,
  PlayerResult,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: ENTITIES,
        migrations: [join(process.cwd(), 'dist/database/migrations/*.js')],
        migrationsRun: false,
        synchronize: false,
        ssl: { rejectUnauthorized: false },
        extra: {
          max: 10,
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 10_000,
          keepAlive: true,
        },
      }),
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
