import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DirectorDto } from '../../director/dto/response/director.dto';

export function ApiDirectorCreate() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 감독 생성하기',
      description: `
## 영화 감독 생성하기`,
    }),
    ApiResponse({
      status: 201,
      description: '영화 감독 생성하기',
      type: DirectorDto,
    }),
  );
}

export function ApiDirectorFindAll() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 감독 목록 불러오기',
      description: `
## 영화 감독 목록 불러오기`,
    }),
    ApiResponse({
      status: 200,
      description: '삭제된 영화 ID',
      type: [DirectorDto],
    }),
  );
}

export function ApiDirectorFindOne() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 감독 하나 가져오기',
      description: `
## 영화 감독 하나 가져오기`,
    }),
    ApiResponse({
      status: 200,
      description: '삭제된 영화 ID',
      type: [DirectorDto],
    }),
  );
}

export function ApiDirectorUpdate() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 감독 변경하기',
      description: `
## 영화 감독 변경하기`,
    }),
    ApiResponse({
      status: 200,
      description: '영화 감독 변경하기',
      type: DirectorDto,
    }),
  );
}

export function ApiDirectorDelete() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 감독 제거하기',
      description: `
## 영화 감독 제거하기
## 감독과 연계된 영화 목록이 사라질 수 있으니 주의`,
    }),
    ApiResponse({
      status: 200,
      description: '감독 제거하기',
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
