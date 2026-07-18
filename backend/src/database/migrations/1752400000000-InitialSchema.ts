import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cria o schema inicial. Os nomes de tabela/coluna são idênticos aos
 * gerados pelo Prisma (schema.prisma original), então este banco é
 * compatível com uma base já populada pelo Prisma.
 *
 * IMPORTANTE — banco que já rodou `prisma migrate`:
 * as tabelas abaixo já existem. Não rode esta migration nele; rode
 * apenas 1752400000001-AddAlunoIdToPlayerResult (veja README/migrations).
 * Esta migration serve para instalações novas (banco vazio).
 */
export class InitialSchema1752400000000 implements MigrationInterface {
  name = 'InitialSchema1752400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    await queryRunner.query(`
      CREATE TABLE "Admin" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "username" varchar NOT NULL,
        "passwordHash" varchar NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_Admin_username" UNIQUE ("username"),
        CONSTRAINT "PK_Admin" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "Theme" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "description" varchar,
        CONSTRAINT "PK_Theme" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "Quiz" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "themeId" uuid NOT NULL,
        "title" varchar NOT NULL,
        CONSTRAINT "PK_Quiz" PRIMARY KEY ("id"),
        CONSTRAINT "FK_Quiz_theme" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "Question" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "quizId" uuid NOT NULL,
        "text" text NOT NULL,
        "imageUrl" varchar,
        "options" jsonb NOT NULL,
        "correctIndex" int NOT NULL,
        "timeLimitSec" int NOT NULL DEFAULT 20,
        "order" int NOT NULL,
        CONSTRAINT "PK_Question" PRIMARY KEY ("id"),
        CONSTRAINT "FK_Question_quiz" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "Turma" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "nome" varchar NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_Turma" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "Aluno" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "turmaId" uuid NOT NULL,
        "nome" varchar NOT NULL,
        CONSTRAINT "PK_Aluno" PRIMARY KEY ("id"),
        CONSTRAINT "FK_Aluno_turma" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "GameSession" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "quizId" uuid NOT NULL,
        "status" varchar NOT NULL DEFAULT 'em_andamento',
        "playedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_GameSession" PRIMARY KEY ("id"),
        CONSTRAINT "FK_GameSession_quiz" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "PlayerResult" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "gameSessionId" uuid NOT NULL,
        "nickname" varchar NOT NULL,
        "avatar" varchar NOT NULL,
        "score" int NOT NULL DEFAULT 0,
        "answers" jsonb NOT NULL DEFAULT '[]',
        "turmaId" uuid,
        "alunoId" uuid,
        CONSTRAINT "PK_PlayerResult" PRIMARY KEY ("id"),
        CONSTRAINT "FK_PlayerResult_session" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_PlayerResult_turma" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_PlayerResult_aluno" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_PlayerResult_alunoId" ON "PlayerResult" ("alunoId");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "PlayerResult";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "GameSession";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Aluno";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Turma";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Question";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Quiz";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Theme";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Admin";`);
  }
}
