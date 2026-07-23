import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnDeleteStrategies1784764713060 implements MigrationInterface {
    name = 'AddOnDeleteStrategies1784764713060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "PlayerResult" DROP CONSTRAINT "FK_29f5d1e1fc5c592db3051c7a0d2"`);
        await queryRunner.query(`ALTER TABLE "GameSession" DROP CONSTRAINT "FK_96cbfd45fb1ecfe9e415b852b70"`);
        await queryRunner.query(`ALTER TABLE "Question" DROP CONSTRAINT "FK_0ca4f96405290bc86c10a98d226"`);
        await queryRunner.query(`ALTER TABLE "Quiz" DROP CONSTRAINT "FK_e1335e579420c16711fd9c0599f"`);
        await queryRunner.query(`ALTER TABLE "GameSession" ALTER COLUMN "quizId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" ADD CONSTRAINT "FK_29f5d1e1fc5c592db3051c7a0d2" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GameSession" ADD CONSTRAINT "FK_96cbfd45fb1ecfe9e415b852b70" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Question" ADD CONSTRAINT "FK_0ca4f96405290bc86c10a98d226" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Quiz" ADD CONSTRAINT "FK_e1335e579420c16711fd9c0599f" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Quiz" DROP CONSTRAINT "FK_e1335e579420c16711fd9c0599f"`);
        await queryRunner.query(`ALTER TABLE "Question" DROP CONSTRAINT "FK_0ca4f96405290bc86c10a98d226"`);
        await queryRunner.query(`ALTER TABLE "GameSession" DROP CONSTRAINT "FK_96cbfd45fb1ecfe9e415b852b70"`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" DROP CONSTRAINT "FK_29f5d1e1fc5c592db3051c7a0d2"`);
        await queryRunner.query(`ALTER TABLE "GameSession" ALTER COLUMN "quizId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Quiz" ADD CONSTRAINT "FK_e1335e579420c16711fd9c0599f" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Question" ADD CONSTRAINT "FK_0ca4f96405290bc86c10a98d226" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GameSession" ADD CONSTRAINT "FK_96cbfd45fb1ecfe9e415b852b70" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" ADD CONSTRAINT "FK_29f5d1e1fc5c592db3051c7a0d2" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
