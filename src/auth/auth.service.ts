import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { envVariableKeys } from '../common/const/env.const';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserService } from '../user/user.service';
import { UserDto, UserToken } from '../user/dto/response/user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async tokenBlock(token: string) {
    const payload = this.jwtService.decode(token);

    const tokenKey = `BLOCKED_TOKEN_${token}`;

    const expiryDate = +new Date(payload['exp'] * 1000);
    const now = +Date.now();
    const diffInSeconds = (expiryDate - now) / 1000;
    console.table({
      expiryDate: expiryDate,
      now: now,
      diffInSeconds: diffInSeconds,
      mathMax: Math.max(diffInSeconds * 1000 * 30, 10),
    });
    await this.cacheManager.set(
      tokenKey,
      payload,
      Math.max(diffInSeconds * 1000 * 30, 10), //계산시간 고려 최소 1ms
    );
    return true;
  }

  parseBasicToken(rawToken: string) {
    // 1. 토큰을 ' '기준으로 split 후 토큰값만 추출
    //['basic', $token]
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [basic, token] = basicSplit;

    if (basic.toLowerCase() !== 'basic') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }
    // 추출한 토큰을 base64 디코딩
    const decoded = Buffer.from(token, 'base64').toString('utf-8');

    // "email:password"
    const tokenSplit = decoded.split(':');
    if (tokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
    }

    const [email, password] = tokenSplit;

    return {
      email,
      password,
    };
  }

  async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
    // 1. 토큰을 ' '기준으로 split 후 토큰값만 추출
    //['bearer', $token]
    const basicSplit = rawToken.split(' ');
    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    const [bearer, token] = basicSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다.');
    }

    try {
      //payload 가져오며 검증도 한다.
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<'string'>(
          isRefreshToken
            ? envVariableKeys.refreshTokenSecret
            : envVariableKeys.accessTokenSecret,
        ),
      });
      if (isRefreshToken) {
        if (payload.type !== 'refresh') {
          throw new BadRequestException('Refresh token 을 입력해주세요');
        }
      } else {
        if (payload.type !== 'access') {
          throw new BadRequestException('Access token 을 입력해주세요');
        }
      }

      return payload;
    } catch (error) {
      console.log(error);
      //error 에 따른 throw 설정 가능
      throw new UnauthorizedException('토큰이 만로되었습니다.');
    }
  }

  //rawToken -> "Basic $token"
  async register(rawToken: string): Promise<UserDto> {
    const { email, password } = this.parseBasicToken(rawToken);
    const user = await this.userService.create({ email, password });

    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true, // 이 옵션을 사용하면 @Expose()가 있는 속성만 포함됩니다
    });
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('잘못된 로그인 정보입니다');
    }

    const passOk = await bcrypt.compare(password, user.password);

    if (!passOk) {
      throw new BadRequestException('잘못된 로그인 정보입니다');
    }

    return user;
  }

  async issueToken(user: { id: number; role: Role }, isRefreshToken: boolean) {
    const refreshTokenSecret = this.configService.get<string>(
      envVariableKeys.refreshTokenSecret,
    );
    const accessTokenSecret = this.configService.get<string>(
      envVariableKeys.accessTokenSecret,
    );

    const expiresIn = isRefreshToken
      ? '24h'
      : process.env.ENV === 'dev'
        ? '24h'
        : '30m'; // 개발 환경에서는 24시간, 그 외에는 30분

    return await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn,
      },
    );
  }

  //rawToken -> "Basic $token"
  async loginUser(rawToken: string): Promise<UserToken> {
    const { email, password } = this.parseBasicToken(rawToken);

    const user = await this.authenticate(email, password);

    return {
      refreshToken: await this.issueToken(user, true),
      accessToken: await this.issueToken(user, false),
    };
  }
}
