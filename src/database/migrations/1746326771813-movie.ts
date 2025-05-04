import { MigrationInterface, QueryRunner } from 'typeorm';

export class Movie1746326771813 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "movie" (
                                                 "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                                                 "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                                                 "version" integer NOT NULL,
                                                 "id" SERIAL NOT NULL,
                                                 "title" character varying NOT NULL,
                                                 "likeCount" integer NOT NULL DEFAULT '0',
                                                 "dislikeCount" integer NOT NULL DEFAULT '0',
                                                 "movieFileName" character varying NOT NULL,
                                                 "creatorId" integer,
                                                 "movieDetailId" integer NOT NULL,
                                                 "directorId" integer NOT NULL,
                                                 CONSTRAINT "UQ_a81090ad0ceb645f30f9399c347" UNIQUE ("title"),
                                                 CONSTRAINT "REL_57f4307aa9ade02f45fd0c5c90" UNIQUE ("movieDetailId"),
                                                 CONSTRAINT "PK_cb3bb4d61cf764dc035cbedd422" PRIMARY KEY ("id")
          )
      `);

    // 모든 FK에 대해 존재 여부 확인
    const checkFk = async (constraintName: string) => {
      const result = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = '${constraintName}'
      )
    `);
      return result[0].exists;
    };

    // creatorId FK
    if (!(await checkFk('FK_b55916de756e46290d52c70fc04'))) {
      await queryRunner.query(`
          ALTER TABLE "movie"
              ADD CONSTRAINT "FK_b55916de756e46290d52c70fc04"
                  FOREIGN KEY ("creatorId")
                      REFERENCES "user"("id")
      `);
    }

    // movieDetailId FK
    if (!(await checkFk('FK_57f4307aa9ade02f45fd0c5c902'))) {
      await queryRunner.query(`
      ALTER TABLE "movie" 
      ADD CONSTRAINT "FK_57f4307aa9ade02f45fd0c5c902" 
      FOREIGN KEY ("movieDetailId") 
      REFERENCES "movie_detail"("id")
    `);
    }

    // directorId FK
    if (!(await checkFk('FK_a32a80a88aff67851cf5b75d1cb'))) {
      await queryRunner.query(`
      ALTER TABLE "movie" 
      ADD CONSTRAINT "FK_a32a80a88aff67851cf5b75d1cb" 
      FOREIGN KEY ("directorId") 
      REFERENCES "director"("id")
    `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백: 외래키 제거 후 테이블 삭제
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "movie" 
      DROP CONSTRAINT IF EXISTS "FK_a32a80a88aff67851cf5b75d1cb"
    `);
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "movie" 
      DROP CONSTRAINT IF EXISTS "FK_57f4307aa9ade02f45fd0c5c902"
    `);
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "movie" 
      DROP CONSTRAINT IF EXISTS "FK_b55916de756e46290d52c70fc04"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "movie"`);
  }
}
