import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class DefaultLogger extends ConsoleLogger {
  // fatal(message: unknown, ...rest: unknown[]): void {
  //   console.log('---- fatal log ----');
  //   super.fatal(message, ...rest);
  // }
  //
  // //error 로그를 오버라이딩한다.
  // error(message: unknown, ...rest: unknown[]): void {
  //   console.log('---- error log ----');
  //   super.error(message, ...rest);
  // }

  //warn 로그를 오버라이딩한다.
  // warn(message: unknown, ...rest: unknown[]): void {
  //   console.log('---- warn log ----');
  //   super.warn(message, ...rest);
  // }

  // 로깅을 특정 파일에 수집한다.
  //
  saveLogRecode() {}
}
