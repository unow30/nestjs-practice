import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from '../movie/entity/movie.entity';
import { DefaultLogger } from './logger/default.logger';
import { BullModule } from '@nestjs/bullmq';
import { FileSystemService } from './fileSystem.service';
import { CursorPaginationService } from './cursor-pagination.service';
import { AwsService } from './aws.service';
import { S3UploadInterceptor } from './interceptor/s3-upload.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie]),

    //bullmq에 등록할 프로세스 작업명 세팅
    //사용할 서비스에서 등록해야 한다.
    BullModule.registerQueue(
      {
        name: 'thumbnail-generation',
      },
      {
        name: 'watermark-generation',
      },
    ),
  ],
  controllers: [CommonController],
  providers: [
    CommonService,
    TasksService,
    FileSystemService,
    CursorPaginationService,
    DefaultLogger,
    AwsService,
    S3UploadInterceptor,
  ],
  exports: [CommonService, AwsService, DefaultLogger, CursorPaginationService],
})
export class CommonModule {}
