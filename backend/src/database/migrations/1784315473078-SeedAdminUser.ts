import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

const ADMIN_USERNAME = 'admin@email.com.br';
const ADMIN_PASSWORD = 'admin123'; // troque após o primeiro login

export class SeedAdminUser1784315473078 implements MigrationInterface {
  name = 'SeedAdminUser1784315473078';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash calculado em tempo de execução (mesmo custo usado em
    // AdminService.createAdmin) — nunca gravamos a senha em texto puro.
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await queryRunner.query(
      `INSERT INTO "Admin" ("username", "passwordHash")
       VALUES ($1, $2)
       ON CONFLICT ("username") DO NOTHING`,
      [ADMIN_USERNAME, passwordHash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "Admin" WHERE "username" = $1`, [
      ADMIN_USERNAME,
    ]);
  }
}
