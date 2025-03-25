// file-upload.decorator.ts
import { UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';
// export function MulterVideoUploadInterceptor(fieldName: string = 'video') {
//   return UseInterceptors(
//     FileInterceptor(fieldName, {
//       limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
//       fileFilter(req, file, callback) {
//         if (file.mimetype !== 'video/mp4') {
//           return callback(
//             new BadRequestException('mp4타입만 업로드 가능합니다.'),
//             false,
//           );
//         }
//         return callback(null, true);
//       },
//     }),
//   );
// }


export const MulterLocalVideoUploadInterceptor = () => {
  return FileInterceptor('video', {
    storage: diskStorage({
      destination: join(process.cwd(), 'public', 'temp'),
      filename(req, file, cb) {
        const split = file.originalname.split('.');
        let ext = 'mp4';
        if (split.length > 1) {
          ext = split[split.length - 1];
        }
        cb(null, `${v4()}_${Date.now()}.${ext}`);
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
