import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnJobIdToMovie1747799739000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movie" ADD COLUMN "jobId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "movie" DROP COLUMN "jobId"`);
  }
}
