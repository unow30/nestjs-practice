import {
  Controller,
  Post,
  Headers,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './strategy/local.strategy';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './strategy/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  //authorization: Basic $token
  registerUser(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  /**
   * 직접 구현한 로그인
   * */
  @Post('login')
  //authorization: Basic $token
  async loginUser(@Headers('authorization') token: string) {
    return await this.authService.loginUser(token);
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

  @Post('token/access')
  async rotateAccessToken(@Headers('authorization') token: string) {
    const payload = await this.authService.parseBearerToken(token, true);
    return {
      accessToken: await this.authService.issueToken(payload, false),
    };
  }

  //passport를 통과하지 못하면 아래 함수는 실행되지 않는다.
  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Request() req) {
    return req.user;
  }
}
