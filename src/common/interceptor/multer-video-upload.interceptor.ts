import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 as Uuid } from 'uuid';

export const MulterS3VideoUpload = () => {};

export const MulterLocalVideoUpload = () => {
  return FileInterceptor('video', {
    storage: diskStorage({
      destination: join(process.cwd(), 'public', 'temp'),
      filename(req, file, cb) {
        const split = file.originalname.split('.');
        let ext = 'mp4';
        if (split.length > 1) {
          ext = split[split.length - 1];
        }
        cb(null, `${Uuid()}_${Date.now()}.${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.includes('video/mp4')) {
        cb(null, true);
      } else {
        cb(new Error('mp4 형식의 파일만 업로드 가능합니다'), false);
      }
    },
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
    },
  });
};
