import { BadRequestException, Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

// --- 타입 정의 ---
interface CursorObject {
  values: Record<string, any>;
  order: string[];
}
/**
 * cursorObj: ex) { values: { id: 20 }, order: [ 'id_DESC' ] }
 * cursor: base64 encoding
 * */
@Injectable()
export class CursorPaginationService {
  async applyCursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    const { cursor, take, order: initialOrder } = dto;
    let order = initialOrder;

    if (cursor) {
      const cursorObj = this.parseCursor(cursor);
      order = cursorObj.order;
      this.applyCursorConditions(qb, cursorObj, qb.alias);
    }

    this.applyOrdering(qb, order, qb.alias);
    qb.take(take);

    const results = await qb.getMany();
    return {
      qb,
      nextCursor: this.generateNextCursor(results, order),
    };
  }

  /**
   * ex: eyJ2YWx1ZXMiOnsiaWQiOjE1fSwib3JkZXIiOlsiaWRfREVTQyJdfQ==
   * */
  private parseCursor(cursor: string): CursorObject {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  }

  /**
   * qb.where(
   * (movie.id) < (:id),
   * { id: 20 }
   * )
   * */
  private applyCursorConditions<T>(
    qb: SelectQueryBuilder<T>,
    cursorObj: CursorObject,
    alias: string,
  ) {
    const { values, order } = cursorObj;
    const columns = Object.keys(values);
    const operator = order.some((o) => o.endsWith('DESC')) ? '<' : '>';
    const condition = `(${columns.map((c) => `${alias}.${c}`).join(',')}) ${operator} (${columns.map((c) => `:${c}`).join(',')})`;

    qb.where(condition, values);
  }

  /**
   * qb.orderBy("column", "ASC") // 첫 번째 정렬 조건
   * qb.addOrderBy("column", "DESC") // 추가 정렬 조건
   * */
  private applyOrdering<T>(
    qb: SelectQueryBuilder<T>,
    order: string[],
    alias: string,
  ) {
    order.forEach((term, index) => {
      const [column, rawDirection] = term.split('_');
      const direction = rawDirection.toUpperCase();

      if (!['ASC', 'DESC'].includes(direction)) {
        throw new BadRequestException('Invalid order direction');
      }
      const method = index === 0 ? 'orderBy' : 'addOrderBy';
      qb[method](`${alias}.${column}`, direction as 'ASC' | 'DESC');
    });
  }

  /**
   * ex: eyJ2YWx1ZXMiOnsiaWQiOjE1fSwib3JkZXIiOlsiaWRfREVTQyJdfQ==
   * */
  generateNextCursor<T>(results: T[], order: string[]): string | null {
    if (!results.length) return null;

    const lastItem = results[results.length - 1];

    // { id: 1, createdAt: '2023-03-19' }
    const values = Object.fromEntries(
      // [['id', 1], ['createdAt', '2023-03-19']]
      order.map((term) => {
        const [column] = term.split('_');
        return [column, lastItem[column]];
      }),
    );

    return Buffer.from(JSON.stringify({ values, order })).toString('base64');
  }
}
