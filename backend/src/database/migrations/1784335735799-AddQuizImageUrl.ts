import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuizImageUrl1784335735799 implements MigrationInterface {
  name = 'AddQuizImageUrl1784335735799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Quiz" ADD COLUMN "imageUrl" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Quiz" DROP COLUMN "imageUrl"`);
  }
}
