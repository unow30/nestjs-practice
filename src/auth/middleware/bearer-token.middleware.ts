import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from '../../common/const/env.const';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    /**
     * basic $token 를 받는 route는 exclude 한다.
     * bearer $token 을 받는 route 는 middleware 를 거친다.
     */
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      next();
      return;
    }

    const token = this.validateBearerToken(authHeader);

    try {
      //디코드만 하고 검증은 안한다.
      const decodedPayload = this.jwtService.decode(token);

      if (
        decodedPayload.type !== 'refresh' &&
        decodedPayload.type !== 'access'
      ) {
        throw new UnauthorizedException('잘못된 토큰입니다.');
      }

      //payload 가져오며 검증도 한다.
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<'string'>(
          decodedPayload.type === 'refresh'
            ? envVariableKeys.refreshTokenSecret
            : envVariableKeys.accessTokenSecret,
        ),
      });

      req['user'] = payload;
      next();
    } catch (error) {
      //error 에 따른 throw 설정 가능
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료되었습니다.');
      }
      next();
    }
  }

  validateBearerToken(rawToken: string) {
    // console.log(rawToken);
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [bearer, token] = basicSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    return token;
  }
}
