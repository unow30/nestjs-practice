import { join } from 'path';
import { Request } from 'express';
import * as fs from 'fs/promises';
import { constants } from 'fs';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class FileSystemService {
  private readonly PATHS = {
    movie: join('public', 'movie'),
    temp: join('public', 'temp'),
  };
  private readonly FILENAMES = {
    origin: 'origin',
    watermark: 'wm',
  };

  async renameMovieFile(filename: string, request: Request) {
    const { name: uuid, ext } = this.parseFilename(filename);
    const targetDir = this.resolvePath(this.PATHS.movie, uuid);

    const paths = {
      source: {
        original: this.resolvePath(this.PATHS.temp, filename),
        watermark: this.resolvePath(this.PATHS.temp, `${uuid}_wm.${ext}`),
      },
      dest: {
        original: join(targetDir, `${this.FILENAMES.origin}.${ext}`),
        watermark: join(targetDir, `${this.FILENAMES.watermark}.${ext}`),
      },
    };

    try {
      await this.ensureDirectoryExists(targetDir);
      await this.moveFile(
        paths.source.watermark,
        paths.dest.watermark,
        '워터마크 파일이 아직 생성되지 않았습니다',
      );
      await this.moveFile(paths.source.original, paths.dest.original);

      return this.buildFileUrls(request, uuid, ext);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.handleFsError(error);
    }
  }

  async getStaticVideoPath(req: Request, page: number, pageSize: number) {
    const basePath = this.resolvePath(this.PATHS.movie);
    const baseURL = `${req.protocol}://${req.get('host')}/${this.PATHS.movie}`;

    try {
      const folders = await fs.readdir(basePath);

      const totalItems = folders.length * 2; // 각 폴더에 최대 2개의 파일이 있다고 가정
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      let currentIndex = 0; // 현재까지 처리한 파일의 인덱스
      const paginatedFiles: string[] = [];

      for (const folder of folders) {
        const folderPath = join(basePath, folder);

        if ((await fs.lstat(folderPath)).isDirectory()) {
          const files = await fs.readdir(folderPath);

          for (const file of files) {
            if (currentIndex >= startIndex && currentIndex < endIndex) {
              paginatedFiles.push(`${baseURL}/${folder}/${file}`);
            }

            currentIndex++;

            // 필요한 범위를 모두 처리했으면 순회를 중단
            if (currentIndex >= endIndex) break;
          }
        }

        // 폴더 순회도 중단
        if (currentIndex >= endIndex) break;
      }

      return {
        data: paginatedFiles,
        meta: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize,
        },
      };
    } catch (error) {
      this.handleFsError(error);
      return {
        data: [],
        meta: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          pageSize,
        },
      };
    }
  }

  private resolvePath(...segments: string[]) {
    return join(process.cwd(), ...segments);
  }

  private parseFilename(filename: string) {
    const [name, ext] = filename.includes('.')
      ? filename.split('.')
      : [filename, ''];
    return { name, ext };
  }

  private async ensureDirectoryExists(dirPath: string) {
    await fs.mkdir(dirPath, { recursive: true });
  }

  private handleFsError(error: NodeJS.ErrnoException) {
    switch (error.code) {
      case 'ENOENT':
        throw new BadRequestException(`파일을 찾을 수 없습니다: ${error.path}`);
      case 'EACCES':
        throw new ForbiddenException(
          `파일 접근 권한이 없습니다: ${error.path}`,
        );
      case 'EPERM':
        throw new ForbiddenException(
          `파일 작업이 허용되지 않습니다: ${error.path}`,
        );
      default:
        throw new HttpException(`파일 처리 오류: ${error.message}`, 500);
    }
  }

  private async moveFile(
    source: string,
    destination: string,
    errorMessage?: string,
  ) {
    try {
      await fs.access(source, constants.F_OK);
      await fs.rename(source, destination);
    } catch (error) {
      if (errorMessage) throw new BadRequestException(errorMessage);
      this.handleFsError(error);
    }
  }

  private buildFileUrls(request: Request, folder: string, ext: string) {
    const protocol = request.headers['x-forwarded-proto'] || request.protocol;
    const host = request.headers['x-forwarded-host'] || request.get('host');
    const baseUrl = `${protocol}://${host}`;

    return {
      original: `${baseUrl}/${this.PATHS.movie}/${folder}/${this.FILENAMES.origin}.${ext}`,
      watermark: `${baseUrl}/${this.PATHS.movie}/${folder}/${this.FILENAMES.watermark}.${ext}`,
    };
  }
}
