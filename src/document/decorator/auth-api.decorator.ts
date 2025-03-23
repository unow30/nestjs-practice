import {
  ApiPropertyCreated,
  ApiPropertyResponse,
  createApiOperation,
} from '../swagger-custom';
import { applyDecorators } from '@nestjs/common';

export function ApiRegisterUser() {
  return applyDecorators(
    createApiOperation(
      '유저 회원가입',
      `
  ## email, password를 base 64 encoding 후 header authorizaion으로 보낸다.
  ## authorize 버튼 > 새로운 email, password 입력 후 로그인 버튼 클릭시 header Authorization 생성 
  ## 해당 api 실행하면 회원가입 진행`,
    ),
    ApiPropertyCreated({
      properties: {
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: '생성시간',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: '변경시간',
        },
        version: {
          type: 'number',
          description: '변경시 숫자 count',
        },
        id: {
          type: 'number',
          description: '유저 id',
        },
        email: {
          type: 'string',
          description: '유저 email',
        },
        password: {
          type: 'string',
          description: '비밀번호(암호화)',
        },
        role: {
          type: 'string',
          description: '0: 관리자, 1:구독유저 2: 유저',
        },
      },
    }),
  );
}

export function ApiLoginUser() {
  return applyDecorators(
    createApiOperation(
      '유저 로그인',
      `
  ## email, password를 base 64 encoding 후 header authorizaion으로 보낸다.
  ## authorize 버튼 > 새로운 email, password 입력 후 로그인 버튼 클릭
  ## 해당 api 실행하면 토큰 생성
  ## authorize 버튼 > bearer (http, Bearer)에 acceseToken 입력 후 로그인`,
    ),
    ApiPropertyResponse({
      properties: {
        refreshToken: {
          type: 'string',
          description: '리프레시 토큰, 24시간 지속',
        },
        accessToken: {
          type: 'string',
          description: '엑세스 토큰, 300초(5분) 지속',
        },
      },
    }),
  );
}
