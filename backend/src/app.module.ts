import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { GameModule } from './game/game.module';
import { QuizModule } from './quiz/quiz.module';
import { ThemeModule } from './theme/theme.module';
import { TurmaModule } from './turma/turma.module';
import { AlunoModule } from './aluno/aluno.module';


@Module({
  imports: [
    DatabaseModule,
    ThemeModule,
    QuizModule,
    TurmaModule,
    AdminModule,
    GameModule,
    AlunoModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
