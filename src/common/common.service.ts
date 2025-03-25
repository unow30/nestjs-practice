import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ObjectCannedACL, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { v4 as Uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from './const/env.const';

@Injectable()
export class CommonService {
  private readonly s3: S3;
  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      credentials: {
        accessKeyId: configService.get<string>(envVariableKeys.awsAccessKeyId),
        secretAccessKey: configService.get<string>(
          envVariableKeys.awsSecretAccessKey,
        ),
      },

      region: configService.get<string>(envVariableKeys.awsRegion),
    });
  }

  async createPresignedUrl(expiresIn = 300) {
    const filename = `${Uuid()}.mp4`;
    const params = {
      Bucket: this.configService.get<string>(envVariableKeys.bucketName),
      //버킷에 생성될 파일명, 경로
      Key: `public/temp/${filename}`,
      // 보두가 읽을 수 있음
      ACL: ObjectCannedACL.public_read,
      ContentType: 'video/mp4', // MIME 타입 명시
    };

    try {
      const url = await getSignedUrl(this.s3, new PutObjectCommand(params), {
        expiresIn,
      });
      return { filename: filename, url: url };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('S3 Presigned Url error');
    }
  }

  async saveMovieToPermanentStorage(filename: string) {
    try {
      const bucketName = this.configService.get<string>(
        envVariableKeys.bucketName,
      );

      await this.s3.copyObject({
        Bucket: bucketName,
        CopySource: `${bucketName}/public/temp/${filename}`,
        Key: `public/movie/${filename}`,
        ACL: 'public-read',
      });

      await this.s3.deleteObject({
        Bucket: bucketName,
        Key: `public/temp/${filename}`,
      });
    } catch (error) {
      const errorMessage = `${error.name}: ${error.message}`;

      throw new InternalServerErrorException(errorMessage);
    }
  }

  async saveLocalMovieToPermanentStorage(filename: string) {}

  applyPagePaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: PagePaginationDto,
  ) {
    const { page, take } = dto;
    const skip = (page - 1) * take;
    qb.take(take);
    qb.skip(skip);
  }
}
