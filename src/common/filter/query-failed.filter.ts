import { QueryFailedError } from 'typeorm';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const request = context.getRequest();
    // const file = request.files;
    // console.log('file', file);

    const status = 400; // 클라이언트 에러라고 가정

    let message = '데이터베이스 에러 발생';

    if (exception.message.includes('duplicate key')) {
      message = '중복 키 에러';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: `${request.method} ${request.url}`,
      message: message,
    });
  }
}
