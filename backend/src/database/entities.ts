// Lista de entidades isolada de qualquer coisa do NestJS (sem @Module,
// sem @Global, sem imports de @nestjs/*). Existe como arquivo separado
// porque o data-source.ts (usado pela CLI do TypeORM para rodar
// migrations) importa este array diretamente — se ele importasse do
// database.module.ts, arrastaria os decorators do Nest (@Global/@Module)
// para dentro do loader ESM da CLI do TypeORM, que não consegue resolver
// esse grafo de import e falha com "does not provide an export".

import { Admin } from '../admin/entities/admin.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { GameSession } from '../game/entities/game-session.entity';
import { PlayerResult } from '../game/entities/player-result.entity';
import { Question } from '../quiz/entities/question.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Theme } from '../theme/entities/theme.entity';
import { Turma } from '../turma/entities/turma.entity';

export const ENTITIES = [
  Admin,
  Theme,
  Quiz,
  Question,
  GameSession,
  PlayerResult,
  Turma,
  Aluno,
];
