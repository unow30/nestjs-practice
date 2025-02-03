import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

export class LocalAuthGuard extends AuthGuard('local') {
  //컨트롤러에 AuthGuard('local')의 string 값 대신 LocalAuthGuard 입력시 AuthGuard('local')과 같은 의미로 사용
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  //PassportStrategy(Strategy, '원하는 strategy 명으로 변경 가능')
  //AuthGuard('변경한 strategy 명으로 사용 가능')
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * Local Strategy
   * validate(): 클라이언트 요청에서 body.username, body.password를 받는다.
   *  constructor의 super에서 요청변수 변경가능
   *  super(usernameField: 'email' body.username -> body.email로 요청)
   * return -> @request()에서 받는다.
   */
  async validate(email: string, password: string) {
    const user = await this.authService.authenticate(email, password);
    return user;
  }
}
