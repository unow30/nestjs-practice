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
import {
  ApiBlockToken,
  ApiLoginUser,
  ApiLoginUserPassport,
  ApiRegisterUser,
  ApiRotateAccessToken,
} from '../document/decorator/auth-api.decorator';
import { LoginDto, UserDto, UserToken } from '../user/dto/response/user.dto';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiBasicAuth()
  @ApiRegisterUser()
  @Post('register')
  //authorization: Basic $token
  registerUser(@Authorization() token: string): Promise<UserDto> {
    return this.authService.register(token);
  }

  /**
   * 직접 구현한 로그인
   * */
  @Public()
  @ApiBasicAuth()
  @ApiLoginUser()
  @Post('login')
  //authorization: Basic $token
  async loginUser(@Authorization() token: string): Promise<UserToken> {
    return await this.authService.loginUser(token);
  }

  // @ApiBlockToken()
  // @Post('token/block')
  // blockToken(@Body('token') token: string) {
  //   return this.authService.tokenBlock(token);
  // }

  /**
   * passport-local 을 이용한 로그인
   * */
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiLoginUserPassport()
  @Post('login/passport')
  async loginUserPassport(@Request() req) {
    return {
      refreshToken: await this.authService.issueToken(req.user, true),
      accessToken: await this.authService.issueToken(req.user, false),
    };
  }

  @Public()
  @ApiRotateAccessToken()
  @Post('token/access')
  async rotateAccessToken(@Request() req) {
    return {
      accessToken: await this.authService.issueToken(
        { id: req.user.sub, role: req.user.role },
        false,
      ),
    };
  }

  //passport를 통과하지 못하면 아래 함수는 실행되지 않는다.
  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Request() req) {
    return req.user;
  }
}
