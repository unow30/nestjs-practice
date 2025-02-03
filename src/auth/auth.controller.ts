import { Controller, Post, Headers, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  //authorization: Basic $token
  registerUser(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Post('login')
  //authorization: Basic $token
  loginUser(@Headers('authorization') token: string) {
    return this.authService.loginUser(token);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login/passport')
  loginUserPassport(@Request() req) {
    return req.user;
  }
}
