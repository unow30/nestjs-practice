import {
  BadRequestException,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from '../../common/const/env.const';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
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

    const blockedToken = await this.cacheManager.get(`BLOCKED_TOKEN_${token}`);
    if (blockedToken) {
      throw new UnauthorizedException('차단된 토큰입니다.');
    }

    const tokenKey = `TOKEN_${token}`;
    const cachedPayload = await this.cacheManager.get(tokenKey);

    // console.log('cachedPayload', cachedPayload);
    if (cachedPayload) {
      req['user'] = cachedPayload;
      return next();
    }

    //디코드만 하고 검증은 안한다.
    const decodedPayload = this.jwtService.decode(token);

    if (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access') {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }

    try {
      //토큰을 한번 검증하면 특정 기간동안 디코딩 할 필요가 없다.
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<'string'>(
          decodedPayload.type === 'refresh'
            ? envVariableKeys.refreshTokenSecret
            : envVariableKeys.accessTokenSecret,
        ),
      });
      /**
       * payload['exp'] -> epoch time seconds
       */
      const expiryDate = +new Date(payload['exp'] * 1000);
      const now = +Date.now();
      const diffInSeconds = (expiryDate - now) / 1000;
      await this.cacheManager.set(
        tokenKey,
        payload,
        Math.max((diffInSeconds - 30) * 1000, 1), //계산시간 고려 최소 1ms
      );

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
