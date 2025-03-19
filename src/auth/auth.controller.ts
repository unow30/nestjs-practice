import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { Public } from './decorator/public.decorator';
import { ApiBasicAuth, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Authorization } from './decorator/authorization.decorator';
import { ApiPropertyResponse } from '../document/swagger-custom';
import { ApiRegisterUser } from '../document/decorator/auth/auth-api.decorator';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiBasicAuth()
  @ApiRegisterUser()
  @Post('register')
  //authorization: Basic $token
  registerUser(@Authorization() token: string) {
    return this.authService.register(token);
  }

  /**
   * 직접 구현한 로그인
   * */
  @Public()
  @ApiBasicAuth()
  @ApiOperation({
    summary: '유저 로그인',
    description: `
  ## email, password를 base 64 encoding 후 header authorizaion으로 보낸다.
  ## authorize 버튼 > 새로운 email, password 입력 후 로그인 버튼 클릭
  ## 해당 api 실행하면 토큰 생성
  ## authorize 버튼 > bearer (http, Bearer)에 acceseToken 입력 후 로그인
 `,
  })
  @ApiPropertyResponse({
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
  })
  @Post('login')
  //authorization: Basic $token
  async loginUser(@Authorization() token: string) {
    return await this.authService.loginUser(token);
  }

  @ApiOperation({
    summary: '유저 로그인',
    description: `
  ### email, password를 base 64 encoding 후 header authorizaion으로 보낸다.
  ### authorize 버튼 > 새로운 email, password 입력 후 로그인 버튼 클릭
  ### 해당 api 실행하면 토큰 생성
  ### authorize 버튼 > bearer (http, Bearer)에 acceseToken 입력 후 로그인`,
  })
  @Post('token/block')
  blockToken(@Body('token') token: string) {
    return this.authService.tokenBlock(token);
  }

  /**
   * passport-local 을 이용한 로그인
   * */
  @UseGuards(LocalAuthGuard)
  @Post('login/passport')
  async loginUserPassport(@Request() req) {
    return {
      refreshToken: await this.authService.issueToken(req.user, true),
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  /*
   미들웨어 적용으로 인한 수정(BearerTokenMiddleware)
   @Post('token/access')
  async rotateAccessToken(@Headers('authorization') token: string) {
    const payload = await this.authService.parseBearerToken(token, true);
    return {
      accessToken: await this.authService.issueToken(payload, false),
    };
  }
  */
  @Public()
  @Post('token/access')
  async rotateAccessToken(@Request() req) {
    return {
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  //passport를 통과하지 못하면 아래 함수는 실행되지 않는다.
  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Request() req) {
    return req.user;
  }
}
