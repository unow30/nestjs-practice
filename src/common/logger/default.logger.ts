import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class DefaultLogger extends ConsoleLogger {
  //warn 로그를 오버라이딩한다.
  warn(message: unknown, ...rest: unknown[]): void {
    console.log('---- warn log ----');
    super.warn(message, ...rest);
  }
  //error 로그를 오버라이딩한다.
  error(message: unknown, ...rest: unknown[]): void {
    console.log('---- error log ----');
    super.error(message, ...rest);
  }
}
