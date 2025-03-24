// file-upload.decorator.ts
import { UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

export function MulterVideoUploadInterceptor(fieldName: string = 'video') {
  return UseInterceptors(
    FileInterceptor(fieldName, {
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
      fileFilter(req, file, callback) {
        if (file.mimetype !== 'video/mp4') {
          return callback(
            new BadRequestException('mp4타입만 업로드 가능합니다.'),
            false,
          );
        }
        return callback(null, true);
      },
    }),
  );
}
