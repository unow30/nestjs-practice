import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/response/user.dto';

export function ApiUserFindAll() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 리스트 불러오기',
      description: `
가입한 사용자 정보 불러오기`,
    }),
    ApiResponse({
      status: 200,
      description: '사용자 리스트 불러오기',
      type: [UserDto],
    }),
    // ApiResponse({
    //   status: 400,
    //   description: '존재하지 않는 영화입니다.',
    //   schema: {
    //     type: 'object',
    //     properties: {
    //       statusCode: { type: 'number', example: 400 },
    //       message: { type: 'string', example: '존재하지 않는 영화입니다.' },
    //       error: { type: 'string', example: 'Bad Request' },
    //     },
    //   },
    // }),
    // ApiResponse({
    //   status: 401,
    //   description: '사용자 정보가 없습니다.',
    //   schema: {
    //     type: 'object',
    //     properties: {
    //       statusCode: { type: 'number', example: 401 },
    //       message: { type: 'string', example: '사용자 정보가 없습니다.' },
    //       error: { type: 'string', example: 'Unauthorized' },
    //     },
    //   },
    // }),
  );
}

// export function ApiDeleteMovie() {
//   return applyDecorators(
//     ApiOperation({
//       summary: '영화 삭제하기',
//       description: `
// ## admin 권한 유저만 가능`,
//     }),
//     ApiResponse({
//       status: 200,
//       description: '삭제된 영화 ID',
//       type: 'number',
//     }),
//     ApiResponse({
//       status: 404,
//       description: '존재하지 않는 id입니다.',
//       schema: {
//         type: 'object',
//         properties: {
//           statusCode: { type: 'number', example: 404 },
//           message: { type: 'string', example: '존재하지 않는 id입니다.' },
//           error: { type: 'string', example: 'Not Found' },
//         },
//       },
//     }),
//   );
// }
//
export function ApiUserFindOne() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 한명 불러오기',
      description: `
## 사용자 한명 불러오기`,
    }),
    ApiResponse({
      status: 200,
      description: '사용자 정보',
      type: UserDto,
    }),
  );
}

export function ApiUserUpdate() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 업데이트',
      description: `
## 사용자 업데이트
## 본인의 정보를 변경가능(로그인해야 사용 가능)
## 이메일, 비밀번호 변경 가능`,
    }),
    ApiResponse({
      status: 200,
      description: '사용자 업데이트',
      type: [UserDto],
    }),
    // ApiResponse({
    //   status: 404,
    //   description: '존재하지 않는 영화의 id 입니다.',
    //   schema: {
    //     type: 'object',
    //     properties: {
    //       statusCode: { type: 'number', example: 404 },
    //       message: {
    //         type: 'string',
    //         example: '존재하지 않는 영화의 id 입니다.',
    //       },
    //       error: { type: 'string', example: 'Not Found' },
    //     },
    //   },
    // }),
    // ApiResponse({
    //   status: 404,
    //   description: '존재하지 않는 감독의 id 입니다.',
    //   schema: {
    //     type: 'object',
    //     properties: {
    //       statusCode: { type: 'number', example: 404 },
    //       message: {
    //         type: 'string',
    //         example: '존재하지 않는 감독의 id 입니다.',
    //       },
    //       error: { type: 'string', example: 'Not Found' },
    //     },
    //   },
    // }),
    // ApiResponse({
    //   status: 404,
    //   description: '존재하지 않는 장르가 있습니다.',
    //   schema: {
    //     type: 'object',
    //     properties: {
    //       statusCode: { type: 'number', example: 404 },
    //       message: {
    //         type: 'string',
    //         example: '존재하지 않는 장르가 있습니다.',
    //       },
    //       error: { type: 'string', example: 'Not Found' },
    //     },
    //   },
    // }),
  );
}

export function ApiUserDelete() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 제거하기',
      description: `
## 사용자 정보 제거하기
## 로그인한 사용자 본인 제거하기
## 본인의 사용자 정보를 변경가능(로그인해야 사용 가능)
## 실제 사용자정보 drop`,
    }),
    ApiResponse({
      status: 200,
      description: '사용자 제거하기',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
        },
      },
    }),
  );
}
