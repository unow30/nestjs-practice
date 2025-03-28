import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GenreDto } from '../../genre/dto/response/genre.dto';

export function ApiGenreCreate() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 장르 생성하기',
      description: `
## 영화 장르 생성하기`,
    }),
    ApiResponse({
      status: 201,
      description: '영화 장르 생성하기',
      type: GenreDto,
    }),
  );
}

export function ApiGenreFindAll() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 장르 목록 불러오기',
      description: `
## 영화 장르 목록 불러오기`,
    }),
    ApiResponse({
      status: 200,
      description: '삭제된 영화 ID',
      type: [GenreDto],
    }),
  );
}

export function ApiGenreFindOne() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 장르 불러오기',
      description: `
## 영화 장르 하나 가져오기`,
    }),
    ApiResponse({
      status: 200,
      description: '삭제된 영화 ID',
      type: [GenreDto],
    }),
  );
}

export function ApiGenreUpdate() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 장르 변경하기',
      description: `
## 영화 장르 변경하기`,
    }),
    ApiResponse({
      status: 200,
      description: '영화 장르 변경하기',
      type: GenreDto,
    }),
  );
}

export function ApiGenreDelete() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 장르 제거하기',
      description: `
## 영화 장르 제거하기`,
    }),
    ApiResponse({
      status: 200,
      description: '영화 장르 제거하기',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
            },
          },
        },
      },
    }),
  );
}
