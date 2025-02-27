import {
  Controller,
  Post,
  Headers,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { Public } from './decorator/public.decorator';
import { ApiBasicAuth, ApiBearerAuth } from '@nestjs/swagger';
import { Authorization } from './decorator/authorization.decorator';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiBasicAuth()
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
  @Post('login')
  //authorization: Basic $token
  async loginUser(@Authorization() token: string) {
    return await this.authService.loginUser(token);
  }

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
