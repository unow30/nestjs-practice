import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * 컨트롤러에 @UseGuards(AuthGuard('local')) AuthGuard('local')의 string 값 대신 LocalAuthGuard 입력시 AuthGuard('local')과 같은 의미로 사용
 */
export class LocalAuthGuard extends AuthGuard('local') {}

/**
 * PassportStrategy(Strategy, '원하는 strategy 명으로 변경 가능')
 * 컨트롤러에 @UseGuards(AuthGuard('변경한 strategy 명으로 사용 가능'))
 *
 * constructor super() 에서 요청변수 변경가능
 * super(usernameField: 'email' body.username -> body.email 로 요청)
 * */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   *  Local Strategy
   * validate(): 클라이언트 요청에서 body.username, body.password를 받는다.
   * return -> @request()에서 받는다.
   */
  async validate(email: string, password: string) {
    const user = await this.authService.authenticate(email, password);
    return user;
  }
}
