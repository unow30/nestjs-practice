import { access, constants, rename } from 'fs/promises';
import { join } from 'path';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MulterService {
  async renameMovieFile(filename: string, request: Request) {
    const movieFolder = join('public', 'movie');
    const tempFolder = join('public', 'temp'); // 경로 수정

    const sourcePath = join(process.cwd(), tempFolder, filename);
    const destinationPath = join(process.cwd(), movieFolder, filename);

    const protocol = request.headers['x-forwarded-proto'] || request.protocol;
    const host = request.headers['x-forwarded-host'] || request.get('host');
    const baseUrl = `${protocol}://${host}`;

    try {
      await access(sourcePath, constants.F_OK);
      await rename(sourcePath, destinationPath);

      return { path: `${baseUrl}/${movieFolder}/${filename}` };
    } catch (error) {
      switch (error.code) {
        case 'ENOENT':
          throw new BadRequestException(`파일을 찾을 수 없습니다: ${filename}`);
        case 'EACCES':
          throw new ForbiddenException(
            `파일 접근 권한이 없습니다: ${filename}`,
          );
        case 'EPERM':
          throw new ForbiddenException(
            `파일 작업이 허용되지 않습니다: ${filename}`,
          );
        default:
          throw new HttpException(
            `파일 처리 중 오류가 발생했습니다: ${error.message}`,
            500,
          );
      }
    }
  }
}
