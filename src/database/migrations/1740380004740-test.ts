import { MigrationInterface, QueryRunner } from 'typeorm';

export class Test1740380004740 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create Table "test" (id SERIAL)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`drop Table "test"`);
  }
}
