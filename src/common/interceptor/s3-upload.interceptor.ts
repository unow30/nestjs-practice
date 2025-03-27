import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { v4 as Uuid } from 'uuid';
import * as multer from 'multer';
import { AwsService } from '../aws.service';

@Injectable()
export class S3UploadInterceptor implements NestInterceptor {
  private readonly s3Client: S3Client;

  constructor(private readonly awsService: AwsService) {
    this.s3Client = this.awsService.getS3Client();
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    // Multer S3 설정
    const upload = multer({
      storage: multerS3({
        s3: this.s3Client,
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
          cb(null, false);
          throw new UnsupportedMediaTypeException(
            'mp4 형식의 파일만 업로드 가능합니다',
          );
        }
      },
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    });

    // 'video' 필드의 단일 파일 업로드 처리
    const multerSingle = upload.single('video');

    return new Observable((observer) => {
      multerSingle(req, res, (err) => {
        if (err) {
          observer.error(err);
          return;
        }
        observer.next(next.handle());
        observer.complete();
      });
    });
  }
}
