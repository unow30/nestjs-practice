import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as Uuid } from 'uuid';
import { AwsService } from './aws.service'; // AwsService를 가져옵니다.
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from './const/env.const';

@Injectable()
export class CommonService {
  constructor(
    private readonly awsService: AwsService, // AwsService 주입
    private readonly configService: ConfigService,
  ) {}

  async createPresignedUrl(expiresIn = 300) {
    const s3Client = this.awsService.getS3Client(); // AwsService에서 S3Client 가져오기
    const uuid = Uuid();
    const originalFilename = `${uuid}.mp4`;
    const watermarkedFilename = `${uuid}_wm.mp4`;

    const bucketName = this.configService.get<string>(
      envVariableKeys.bucketName,
    );
    const basePath = 'public/temp';

    // 원본 파일 파라미터
    const originalParams = {
      Bucket: bucketName,
      Key: `${basePath}/${originalFilename}`,
      ACL: ObjectCannedACL.public_read,
      ContentType: 'video/mp4',
    };

    // 워터마크 파일 파라미터
    const watermarkedParams = {
      Bucket: bucketName,
      Key: `${basePath}/${watermarkedFilename}`,
      ACL: ObjectCannedACL.public_read,
      ContentType: 'video/mp4',
    };

    try {
      // 두 개의 presigned URL을 병렬로 생성
      const [originalUrl, watermarkedUrl] = await Promise.all([
        getSignedUrl(s3Client, new PutObjectCommand(originalParams), {
          expiresIn,
        }),
        getSignedUrl(s3Client, new PutObjectCommand(watermarkedParams), {
          expiresIn,
        }),
      ]);

      return [
        { filename: originalFilename, url: originalUrl },
        { filename: watermarkedFilename, url: watermarkedUrl },
      ];
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('S3 Presigned Url error');
    }
  }

  async saveMovieToPermanentStorage(filename: string) {
    const s3Client = this.awsService.getS3Client(); // AwsService에서 S3Client 가져오기
    try {
      const bucketName = this.configService.get<string>(
        envVariableKeys.bucketName,
      );

      await s3Client.send(
        new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: `${bucketName}/public/temp/${filename}`,
          Key: `public/movie/${filename}`,
          ACL: 'public-read',
        }),
      );

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: `public/temp/${filename}`,
        }),
      );
    } catch (error) {
      const errorMessage = `${error.name}: ${error.message}`;
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
