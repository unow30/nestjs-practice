import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ObjectCannedACL, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { v4 as Uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from './const/env.const';

@Injectable()
export class CommonService {
  private readonly s3: S3;
  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      credentials: {
        accessKeyId: configService.get<string>(envVariableKeys.awsAccessKeyId),
        secretAccessKey: configService.get<string>(
          envVariableKeys.awsSecretAccessKey,
        ),
      },

      region: configService.get<string>(envVariableKeys.awsRegion),
    });
  }

  async createPresignedUrl(expiresIn = 300) {
    const filename = `${Uuid()}.mp4`;
    const params = {
      Bucket: this.configService.get<string>(envVariableKeys.bucketName),
      //버킷에 생성될 파일명, 경로
      Key: `public/temp/${filename}`,
      // 보두가 읽을 수 있음
      ACL: ObjectCannedACL.public_read,
      ContentType: 'video/mp4', // MIME 타입 명시
    };

    try {
      const url = await getSignedUrl(this.s3, new PutObjectCommand(params), {
        expiresIn,
      });
      return { filename: filename, url: url };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('S3 Presigned Url error');
    }
  }

  async saveMovieToPermanentStorage(filename: string) {
    try {
      const bucketName = this.configService.get<string>(
        envVariableKeys.bucketName,
      );

      await this.s3.copyObject({
        Bucket: bucketName,
        CopySource: `${bucketName}/public/temp/${filename}`,
        Key: `public/movie/${filename}`,
        ACL: 'public-read',
      });

      await this.s3.deleteObject({
        Bucket: bucketName,
        Key: `public/temp/${filename}`,
      });
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('S3 upload error');
    }
  }

  applyPagePaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: PagePaginationDto,
  ) {
    const { page, take } = dto;
    const skip = (page - 1) * take;
    qb.take(take);
    qb.skip(skip);
  }

  async applyCursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    const { cursor, take } = dto;
    let { order } = dto;

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
      /**
       * cursor 구조
       * {
       *   values: {
       *     id: 27
       *   },
       *   order:['id_desc']
       * }
       * */
      const cursorObj = JSON.parse(decodedCursor);

      order = cursorObj.order;

      const { values } = cursorObj;

      const columns = Object.keys(values);
      // > : <
      const comparisonOperator = order.some((o) => o.endsWith('DESC'))
        ? '<'
        : '>';

      //(column1, column2, column3)
      const whereConditions = columns.map((c) => `${qb.alias}.${c}`).join(',');

      //(:value1, :value2, :value3)
      const whereParams = columns.map((c) => `:${c}`).join(',');

      qb.where(
        // (column1, column2, column3) > (:value1, :value2, :value3)
        `(${whereConditions}) ${comparisonOperator} (${whereParams})`,
        values,
      );
    }

    // order = [likeCount_desc, id_desc]
    for (let i = 0; i < order.length; i++) {
      const [column, direction] = order[i].split('_');

      if (direction !== 'ASC' && direction !== 'DESC') {
        throw new BadRequestException('order는 ASC 또는 DESC로 던저주세요');
      }

      if (i === 0) {
        qb.orderBy(`${qb.alias}.${column}`, direction);
      } else {
        qb.addOrderBy(`${qb.alias}.${column}`, direction);
      }
    }
    qb.take(take);

    const result = await qb.getMany();
    const nextCursor = this.generateNextCursor(result, order);
    return { qb, nextCursor };
  }

  //<T>를 받는 이유: 쿼리 실행 응답값을 넣어주기 위해서. 서버에서 cursor를 만들어 주기 위해서 필요
  generateNextCursor<T>(results: T[], order: string[]): string | null {
    if (results.length === 0) return null; //응답값이 없다면 마지막 데이터다.
    /**
     * cursor 구조
     * {
     *   values: {
     *     id: 27
     *   },
     *   order:['id_desc']
     * }
     * */
    const lastItem = results[results.length - 1];
    const values = {};

    order.forEach((columnOrder) => {
      const [column] = columnOrder.split('_');
      values[column] = lastItem[column];
    });

    const cursorObj = { values, order };
    const nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString(
      'base64',
    );
    console.log('nextCursor', nextCursor);
    return nextCursor;
  }
}
