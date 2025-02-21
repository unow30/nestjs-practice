import * as winston from 'winston';
import { join } from 'path';

export const winstonConfig = {
  level: 'debug',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize({ all: true }),
        winston.format.printf(
          ({ timestamp, context, level, message, stack }) => {
            const logMessage = `${timestamp} ${context} ${level} ${message}`;
            return stack ? `${logMessage}\n${stack}` : logMessage; // 스택이 있으면 추가
          },
        ),
      ),
    }),
    new winston.transports.File({
      dirname: join(process.cwd(), 'logs'),
      filename: 'logs.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, context, level, message, stack }) => {
            const logMessage = `${timestamp} ${context} ${level} ${message}`;
            return stack ? `${logMessage}\n${stack}` : logMessage; // 스택이 있으면 추가
          },
        ),
      ),
    }),
  ],
};
