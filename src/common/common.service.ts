import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
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
        {
          filename: watermarkedFilename,
          url: watermarkedUrl,
        },
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

      // 초기 파일 존재 여부 확인
      const [originFileExists, wmFileExists] = await Promise.all([
        this.doesObjectExist(
          s3Client,
          bucketName,
          `public/temp/${filename}.mp4`,
        ),
        this.doesObjectExist(
          s3Client,
          bucketName,
          `public/temp/${filename}_wm.mp4`,
        ),
      ]);

      if (!originFileExists && !wmFileExists) {
        console.log(
          'Both origin and watermark files do not exist. Skipping all operations.',
        );
        return;
      }

      if (!originFileExists) {
        console.log(
          `Origin file (${filename}.mp4) does not exist. Skipping related operations.`,
        );
      }

      if (!wmFileExists) {
        console.log(
          `Watermark file (${filename}_wm.mp4) does not exist. Skipping related operations.`,
        );
      }

      // 첫 번째 CopyObjectCommand 실행 (origin 파일이 있을 경우)
      if (originFileExists) {
        await s3Client.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/public/temp/${filename}.mp4`,
            Key: `public/movie/${filename}/origin.mp4`,
            ACL: 'public-read',
          }),
        );
      }

      // 두 번째 CopyObjectCommand 실행 (watermark 파일이 있을 경우)
      if (wmFileExists) {
        await s3Client.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/public/temp/${filename}_wm.mp4`,
            Key: `public/movie/${filename}/wm.mp4`,
            ACL: 'public-read',
          }),
        );
      }

      // 첫 번째 DeleteObjectCommand 실행 (origin 파일이 있을 경우)
      if (originFileExists) {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: `public/temp/${filename}.mp4`,
          }),
        );
      }

      // 두 번째 DeleteObjectCommand 실행 (watermark 파일이 있을 경우)
      if (wmFileExists) {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: `public/temp/${filename}_wm.mp4`,
          }),
        );
      }

      console.log('S3 operations completed successfully');
    } catch (error) {
      console.error('Error during S3 operations:', error);
      throw error;
    }
  }

  async doesObjectExist(
    s3Client: S3Client,
    bucketName: string,
    key: string,
  ): Promise<boolean> {
    try {
      const headParams = { Bucket: bucketName, Key: key };
      await s3Client.send(new HeadObjectCommand(headParams));
      return true; // Object exists
    } catch (error) {
      if (error.name === 'NotFound') {
        return false; // Object does not exist
      }
      throw error; // Other errors
    }
  }
}
