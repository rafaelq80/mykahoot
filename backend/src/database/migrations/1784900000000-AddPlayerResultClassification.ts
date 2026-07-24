import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlayerResultClassification1784900000000 implements MigrationInterface {
  name = 'AddPlayerResultClassification1784900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PlayerResult" ADD "correctCount" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "PlayerResult" ADD "wrongCount" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "PlayerResult" ADD "classificacao" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PlayerResult" DROP COLUMN "classificacao"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PlayerResult" DROP COLUMN "wrongCount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PlayerResult" DROP COLUMN "correctCount"`,
    );
  }
}
