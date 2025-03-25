import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3'; // AWS SDK v3의 S3Client
import { envVariableKeys } from './const/env.const';

@Injectable()
export class AwsService {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    // AWS SDK v3의 S3Client 초기화
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.get<string>(
          envVariableKeys.awsAccessKeyId,
        ),
        secretAccessKey: this.configService.get<string>(
          envVariableKeys.awsSecretAccessKey,
        ),
      },
      region: this.configService.get<string>(envVariableKeys.awsRegion),
    });
  }

  getS3Client() {
    return this.s3Client;
  }
}
