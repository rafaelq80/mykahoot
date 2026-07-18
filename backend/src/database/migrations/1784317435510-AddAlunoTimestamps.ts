import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAlunoTimestamps1784317435510 implements MigrationInterface {
    name = 'AddAlunoTimestamps1784317435510'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Aluno" DROP CONSTRAINT "FK_Aluno_turma"`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" DROP CONSTRAINT "FK_PlayerResult_session"`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" DROP CONSTRAINT "FK_PlayerResult_turma"`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" DROP CONSTRAINT "FK_PlayerResult_aluno"`);
        await queryRunner.query(`ALTER TABLE "GameSession" DROP CONSTRAINT "FK_GameSession_quiz"`);
        await queryRunner.query(`ALTER TABLE "Question" DROP CONSTRAINT "FK_Question_quiz"`);
        await queryRunner.query(`ALTER TABLE "Quiz" DROP CONSTRAINT "FK_Quiz_theme"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_PlayerResult_alunoId"`);
        await queryRunner.query(`ALTER TABLE "Aluno" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "Aluno" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_ecfd1ae711ac0af74cae4534ee" ON "PlayerResult"  ("alunoId") `);
        await queryRunner.query(`ALTER TABLE "Aluno" ADD CONSTRAINT "FK_fec865f07f7d37c1eb68d9c2850" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" ADD CONSTRAINT "FK_29f5d1e1fc5c592db3051c7a0d2" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" ADD CONSTRAINT "FK_dac6868a8f1610d47eb149bc883" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" ADD CONSTRAINT "FK_ecfd1ae711ac0af74cae4534ee0" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GameSession" ADD CONSTRAINT "FK_96cbfd45fb1ecfe9e415b852b70" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Question" ADD CONSTRAINT "FK_0ca4f96405290bc86c10a98d226" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Quiz" ADD CONSTRAINT "FK_e1335e579420c16711fd9c0599f" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Quiz" DROP CONSTRAINT "FK_e1335e579420c16711fd9c0599f"`);
        await queryRunner.query(`ALTER TABLE "Question" DROP CONSTRAINT "FK_0ca4f96405290bc86c10a98d226"`);
        await queryRunner.query(`ALTER TABLE "GameSession" DROP CONSTRAINT "FK_96cbfd45fb1ecfe9e415b852b70"`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" DROP CONSTRAINT "FK_ecfd1ae711ac0af74cae4534ee0"`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" DROP CONSTRAINT "FK_dac6868a8f1610d47eb149bc883"`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" DROP CONSTRAINT "FK_29f5d1e1fc5c592db3051c7a0d2"`);
        await queryRunner.query(`ALTER TABLE "Aluno" DROP CONSTRAINT "FK_fec865f07f7d37c1eb68d9c2850"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ecfd1ae711ac0af74cae4534ee"`);
        await queryRunner.query(`ALTER TABLE "Aluno" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "Aluno" DROP COLUMN "createdAt"`);
        await queryRunner.query(`CREATE INDEX "IDX_PlayerResult_alunoId" ON "PlayerResult" USING btree ("alunoId") `);
        await queryRunner.query(`ALTER TABLE "Quiz" ADD CONSTRAINT "FK_Quiz_theme" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Question" ADD CONSTRAINT "FK_Question_quiz" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GameSession" ADD CONSTRAINT "FK_GameSession_quiz" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" ADD CONSTRAINT "FK_PlayerResult_aluno" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" ADD CONSTRAINT "FK_PlayerResult_turma" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "PlayerResult" ADD CONSTRAINT "FK_PlayerResult_session" FOREIGN KEY ("gameSessionId") REFERENCES "GameSession"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Aluno" ADD CONSTRAINT "FK_Aluno_turma" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
