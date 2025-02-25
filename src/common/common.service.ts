import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';
import * as AWS from 'aws-sdk';
import { v4 as Uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from './const/env.const';

@Injectable()
export class CommonService {
  private s3: AWS.S3;
  constructor(private readonly configService: ConfigService) {
    AWS.config.update({
      credentials: {
        accessKeyId: configService.get<string>(envVariableKeys.awsAccessKeyId),
        secretAccessKey: configService.get<string>(
          envVariableKeys.awsSecretAccessKey,
        ),
      },
      region: configService.get<string>(envVariableKeys.awsRegion),
    });

    this.s3 = new AWS.S3();
  }

  async createPresignedUrl(expiresIn = 300) {
    const params = {
      Bucket: this.configService.get<string>(envVariableKeys.bucketName),
      //버킷에 생성될 파일명, 경로
      Key: `temp/${Uuid()}.mp4`,
      Expires: expiresIn,
      // 보두가 읽을 수 있음
      ACL: 'public-read',
    };

    try {
      const url = await this.s3.getSignedUrlPromise('putObject', params);
      return url;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('S3 Presigned Url error');
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

      // (column1, column2, column3) > (:value1, :value2, :value3)
      const columns = Object.keys(values);
      const comparisonOperator = order.some((o) => o.endsWith('DESC'))
        ? '<'
        : '>';
      const whereConditions = columns.map((c) => `${qb.alias}.${c}`).join(',');
      const whereParams = columns.map((c) => `:${c}`).join(',');
      qb.where(
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
