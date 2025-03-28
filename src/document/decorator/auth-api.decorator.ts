import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto, UserDto, UserToken } from '../../user/dto/response/user.dto';

export function ApiRegisterUser() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 회원가입',
      description: `
  ## email, password를 base 64 encoding 후 header authorizaion으로 보낸다.
  ## authorize 버튼 > 새로운 email, password 입력 후 로그인 버튼 클릭시 header Authorization 생성 
  ## 해당 api 실행하면 회원가입 진행,
 `,
    }),
    ApiResponse({
      status: 201,
      description: '사용자 회원가입',
      type: UserDto,
    }),
    ApiResponse({
      status: 400,
      description: '이미 가입한 이메일입니다.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: '이미 가입한 이메일입니다.' },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
  );
}

export function ApiLoginUser() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 로그인',
      description: `
  ## email, password를 base 64 encoding 후 header authorizaion으로 보낸다.
  ## authorize 버튼 > 회원가입한 email, password 입력 후 로그인 버튼 클릭 >  header Authorization 생성
  ## 해당 api 실행하면 토큰 생성
  ## authorize 버튼 > bearer (http, Bearer)에 acceseToken 입력 후 로그인
  ## 배포환경 accessToken 30분 만료, 개발환경에선 24시간 만료
 `,
    }),
    ApiResponse({
      status: 201,
      description: '사용자 회원가입',
      type: UserToken,
    }),
  );
}

export function ApiBlockToken() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 토큰 차단',
      description: `
  ## 관리자 기능      
  ## 특정 사용자의 토큰을 입력하여 토큰을 임시 차단시킨다
  ## 토큰이 필요한 접근시 캐싱이 해지될 때까지 토큰 필요한 접근 제한됨 `,
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: '검증할 토큰 문자열',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
        required: ['token'],
      },
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
  );
}

export function ApiLoginUserPassport() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 로그인 local passport 방식',
      description: `
  ## 사용자 로그인 local passport 방식
  ## 해당 api 실행하면 토큰 생성
  ## authorize 버튼 > bearer (http, Bearer)에 acceseToken 입력 후 로그인`,
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: '로그인 성공',
      type: UserToken,
    }),
  );
}

export function ApiRotateAccessToken() {
  return applyDecorators(
    ApiOperation({
      summary: '토큰 갱신하기',
      description: `
  ## 리프레시 토큰을 입력하여 새 토큰 갱신하기
  ## 해당 api 실행하면 엑세스 토큰 생성
  ## header['authorization']에 리프레시 토큰 전송
  ## authorize > 'bearer 리프레시토큰' 입력 후 실행
  ## authorize 버튼 > bearer (http, Bearer)에 새로운 엑세스토큰 입력`,
    }),
    ApiHeader({
      name: 'Authorization',
      description: 'Bearer 토큰',
      required: true,
      schema: {
        type: 'string',
        example: 'Bearer 리프레시토큰',
      },
    }),
  );
}

export function ApiPrivate() {
  return applyDecorators(
    ApiOperation({
      summary: '로그인 유저의 access token정보 확인용',
      description: `
  ## 로그인 유저의 토큰정보 확인용
  `,
    }),
  );
}
