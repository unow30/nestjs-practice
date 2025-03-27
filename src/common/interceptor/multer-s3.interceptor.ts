import { Type, mixin } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { v4 as Uuid } from 'uuid';

export function S3FileInterceptor(
  s3Client: S3Client,
  fieldName: string = 'video',
  options?: MulterOptions,
): Type<any> {
  const defaultOptions: MulterOptions = {
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.S3_BUCKET_NAME,
      acl: 'public-read',
      key: function (req, file, cb) {
        const split = file.originalname.split('.');
        let ext = 'mp4';
        if (split.length > 1) {
          ext = split[split.length - 1];
        }
        cb(null, `temp/${Uuid()}_${Date.now()}.${ext}`);
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
  };

  return mixin(FileInterceptor(fieldName, { ...defaultOptions, ...options }));
}
