import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  // 연습을 위해 메모리에 직접 입력. 레디스를 추천
  private cache = new Map<string, any>();

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    /// GET /movie
    const key = `${request.method}-${request.path}`;
    if (this.cache.has(key)) {
      return of(this.cache.get(key));
    }
    return next.handle().pipe(tap((response) => this.cache.set(key, response)));
  }
}
