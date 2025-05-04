import { MigrationInterface, QueryRunner } from 'typeorm';

export class MovieLike1746356368530 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "movie_user_like"
                             (
                                 "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                                 "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                                 "version"   integer   NOT NULL,
                                 "movieId"   integer   NOT NULL,
                                 "userId"    integer   NOT NULL,
                                 "isLike"    boolean   NOT NULL,
                                 CONSTRAINT "PK_55397b3cefaa6fc1b47370fe84e" PRIMARY KEY ("movieId", "userId")
                             )`);

    // 모든 FK에 대해 존재 여부 확인
    const checkFk = async (constraintName: string) => {
      const result = await queryRunner.query(`
          SELECT EXISTS (SELECT 1
                         FROM pg_constraint
                         WHERE conname = '${constraintName}')
      `);
      return result[0].exists;
    };

    if (!(await checkFk('FK_fd47c2914ce011f6966368c8486'))) {
      await queryRunner.query(`ALTER TABLE IF EXISTS "movie_user_like"
        ADD CONSTRAINT "FK_fd47c2914ce011f6966368c8486" FOREIGN KEY ("movieId") REFERENCES "movie" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    if (!(await checkFk('FK_6a4d1cde9def796ad01b9ede541'))) {
      await queryRunner.query(`ALTER TABLE IF EXISTS "movie_user_like"
        ADD CONSTRAINT "FK_6a4d1cde9def796ad01b9ede541" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE IF EXISTS "movie_user_like"
        DROP CONSTRAINT "FK_6a4d1cde9def796ad01b9ede541"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "movie_user_like"
        DROP CONSTRAINT "FK_fd47c2914ce011f6966368c8486"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "movie_user_like"`);
  }
}
