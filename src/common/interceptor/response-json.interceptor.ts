// api-response.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../response/response.dto';

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const originalUrl = req.originalUrl || req.url; // originalUrl 사용

    return next.handle().pipe(
      map((data) => ({
        status: res.statusCode,
        url: originalUrl, // 여기서 originalUrl 사용
        data: data,
      })),
    );
  }
}
