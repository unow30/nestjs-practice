import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import {
  MovieListResponseDto,
  MovieDto,
  MovieListRecentDto,
} from '../../movie/dto/response/movie.dto';

export function ApiGetMovieRecent() {
  return applyDecorators(
    ApiOperation({
      summary: '최신 영화 목록 불러오기',
      description: `
## 생성일자 기준 내림차순으로 영화 정렬하기
## 처음 불러온 데이터를 5분동안 캐싱(Cache Manager)`,
    }),
    ApiResponse({
      status: 200,
      description: '최신 영화 리스트',
      type: [MovieListRecentDto],
    }),
  );
}

export function ApiCreateMovieLike() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 좋아요',
      description: `
## movie/:id 에서 좋아요 여부 확인 가능
## 좋아요를 처음 누른 상태면 이를 생성한다.
## 좋아요를 다시 누르면 이를 제거한다.
## 싫어요를 누르면 싫어요로 변경한다.`,
    }),
    ApiResponse({
      status: 200,
      description: '좋아요 상태',
      schema: {
        type: 'object',
        properties: {
          isLike: {
            type: 'boolean',
            description: '좋아요 상태',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '존재하지 않는 영화입니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: '존재하지 않는 영화입니다.' },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: '사용자 정보가 없습니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: '사용자 정보가 없습니다.' },
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
  );
}

export function ApiCreateMovieDisLike() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 싫어요',
      description: `
## movie/:id 에서 싫어요 여부 확인 가능
## 싫어요를 처음 누른 상태면 이를 생성한다.
## 싫어요를 다시 누르면 이를 제거한다.
## 좋아요를 누르면 좋아요로 변경한다.`,
    }),
    ApiResponse({
      status: 200,
      description: '싫어요 상태',
      schema: {
        type: 'object',
        properties: {
          isLike: {
            type: 'boolean',
            description: '싫어요 상태',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: '존재하지 않는 영화입니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: '존재하지 않는 영화입니다.' },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: '사용자 정보가 없습니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: '사용자 정보가 없습니다.' },
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
  );
}

export function ApiDeleteMovie() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 삭제하기',
      description: `
## admin 권한 유저만 가능`,
    }),
    ApiResponse({
      status: 200,
      description: '삭제된 영화 ID',
      type: 'number',
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 id입니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: '존재하지 않는 id입니다.' },
          error: { type: 'string', example: 'Not Found' },
        },
      },
    }),
  );
}

export function ApiGetMovie() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 불러오기',
      description: `
## 선택한 영화는 캐싱되어 'api movie/my-pick' 에서 확인 가능 (Cache Manager)`,
    }),
    ApiResponse({
      status: 200,
      description: '영화 상세 정보',
      type: MovieDto,
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 id의 영화입니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: {
            type: 'string',
            example: '존재하지 않는 id의 영화입니다.',
          },
          error: { type: 'string', example: 'Not Found' },
        },
      },
    }),
  );
}

export function ApiPatchMovie() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 수정하기',
      description: `
## admin 권한 유저만 가능
## 영화제목, 상세내용, 감독, 장르, 파일명 변경 가능
## s3에 업로드한 파일정보를 변경한다.`,
    }),
    ApiResponse({
      status: 200,
      description: '수정된 영화 정보',
      type: MovieDto,
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 영화의 id 입니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: {
            type: 'string',
            example: '존재하지 않는 영화의 id 입니다.',
          },
          error: { type: 'string', example: 'Not Found' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 감독의 id 입니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: {
            type: 'string',
            example: '존재하지 않는 감독의 id 입니다.',
          },
          error: { type: 'string', example: 'Not Found' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 장르가 있습니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: {
            type: 'string',
            example: '존재하지 않는 장르가 있습니다.',
          },
          error: { type: 'string', example: 'Not Found' },
        },
      },
    }),
  );
}

export function ApiPostMovie() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 생성하기',
      description: `
## admin 권한 유저만 가능
## movieFileName에 업로드로 변경된 비디오 파일명을 적는다.(uuid.mp4)
## prod환경: post common/presigned-url로 업로드한 파일명(uuid.mp4)을 movieFileName에 입력하면 s3 파일경로변경
- ### s3 bucket temp 폴더에 저장된 파일이 movie 폴더로 이동
- ### 잘못된 파일명 입력시 NoSuchKey: The specified key does not exist.`,
    }),
    ApiResponse({
      status: 201,
      description: '생성된 영화 정보',
      type: MovieDto,
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않은 id의 감독입니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: {
            type: 'string',
            example: '존재하지 않은 id의 감독입니다.',
          },
          error: { type: 'string', example: 'Not Found' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: '존재하지 않는 장르가 있습니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: {
            type: 'string',
            example: '존재하지 않는 장르가 있습니다.',
          },
          error: { type: 'string', example: 'Not Found' },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: {
            type: 'string',
            example:
              'NoSuchKey: The specified key does not exist.(s3 업로드 관련 이슈)',
          },
          error: { type: 'string', example: 'Internal Server Error' },
        },
      },
    }),
  );
}

export function ApiGetMovies() {
  return applyDecorators(
    ApiOperation({
      summary: '영화 리스트 가져오기',
      description: `
## cursor pagination
## movie entity의 칼럼명에 오름차순, 내림차순을 입력하여 정렬한다.
  ex:['id_DESC'], ['id_DESC', 'title_ASC', 'likeCount_DESC']
## cursor값을 받아 입력하면 다음 패이징한 값을 받을 수 있다.
  cursor는 base64로 인코딩되며 클라이언트가 이를 해석할 필요 없다.`,
    }),
    ApiResponse({
      status: 200,
      description: '영화 리스트',
      type: MovieListResponseDto,
    }),
  );
}
