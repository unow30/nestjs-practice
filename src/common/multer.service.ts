import { access, constants, rename } from 'fs/promises';
import { join } from 'path';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { mkdir } from 'fs/promises';

@Injectable()
export class MulterService {
  async renameMovieFile(filename: string, request: Request) {
    const movieFolder = join('public', 'movie');
    const tempFolder = join('public', 'temp');

    // 파일명에서 확장자를 제외한 UUID 부분 추출 (폴더명으로 사용)
    const fileNameWithoutExt = filename.split('.')[0];
    const uuidFolderName = fileNameWithoutExt;

    // 워터마크 파일명 생성
    const fileExt = filename.split('.').pop();
    const watermarkFilename = `${fileNameWithoutExt}_wm.${fileExt}`;

    // 폴더 경로 설정
    const uuidFolder = join(movieFolder, uuidFolderName);
    const fullUuidFolderPath = join(process.cwd(), uuidFolder);

    // 원본 파일 경로
    const sourceOriginalPath = join(process.cwd(), tempFolder, filename);
    const destinationOriginalPath = join(
      fullUuidFolderPath,
      `origin.${fileExt}`,
    );

    // 워터마크 파일 경로
    const sourceWatermarkPath = join(
      process.cwd(),
      tempFolder,
      watermarkFilename,
    );

    const destinationWatermarkPath = join(fullUuidFolderPath, `wm.${fileExt}`);

    const protocol = request.headers['x-forwarded-proto'] || request.protocol;
    const host = request.headers['x-forwarded-host'] || request.get('host');
    const baseUrl = `${protocol}://${host}`;

    try {
      // 워터마크 파일 존재 확인('파일이 생성중인 경우)
      try {
        await access(sourceWatermarkPath, constants.F_OK);
      } catch (error) {
        if (error.code === 'ENOENT') {
          throw new BadRequestException(
            '파일이 아직 변환중입니다. 워터마크 파일이 생성되지 않았습니다.',
          );
        }
      }

      // 원본 파일 존재 확인
      await access(sourceOriginalPath, constants.F_OK);

      // UUID 폴더가 없으면 생성
      await mkdir(fullUuidFolderPath, { recursive: true });

      // 원본 파일 이동 (이름 변경: origin.mp4)
      await rename(sourceOriginalPath, destinationOriginalPath);

      // 워터마크 파일 이동 (이름 변경: wm.mp4)
      await rename(sourceWatermarkPath, destinationWatermarkPath);

      return {
        originalPath: `${baseUrl}/${uuidFolder}/origin.${fileExt}`,
        watermarkPath: `${baseUrl}/${uuidFolder}/wm.${fileExt}`,
      };
    } catch (error) {
      switch (error.code) {
        case 'ENOENT':
          throw new BadRequestException(
            `파일을 찾을 수 없습니다: ${error.path}`,
          );
        case 'EACCES':
          throw new ForbiddenException(
            `파일 접근 권한이 없습니다: ${error.path}`,
          );
        case 'EPERM':
          throw new ForbiddenException(
            `파일 작업이 허용되지 않습니다: ${error.path}`,
          );
        default:
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new HttpException(
            `파일 처리 중 오류가 발생했습니다: ${error.message}`,
            500,
          );
      }
    }
  }
}
