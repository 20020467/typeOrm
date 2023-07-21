import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1685689843910 implements MigrationInterface {
  // thực hiện quá trình migration
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE student RENAME COLUMN Code TO MSV`);
  }

  // Hoàn tác thay đổi cuối cùng
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE student RENAME COLUMN MSV TO Code`);
  }
}
