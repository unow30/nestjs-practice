import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { UpdateLocalFilePathDto } from '../movie/dto/update-local-filepath.dto';
import { Request } from 'express';
import { MulterService } from './multer.service';
import { join } from 'path';
import { MulterLocalVideoUpload } from './interceptor/multer-video-upload.interceptor';
import {
  ApiCreatePresignedUrl,
  ApiCreateVideo,
  ApiCreateVideoS3,
  ApiPublishVideo,
} from '../document/decorator/video-api.decorator';

@Controller('common')
@ApiBearerAuth()
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    private readonly multerService: MulterService,
    // @InjectQueue('thumbnail-generation')
    // private readonly thumbnailQueue: Queue,
    @InjectQueue('watermark-generation')
    private readonly watermarkQueue: Queue,
  ) {}

  @Post('/presigned-url')
  @ApiCreatePresignedUrl()
  async createPresignedUrl() {
    return await this.commonService.createPresignedUrl();
  }

  @Post('video/multer-s3')
  //todo: s3/temp/uuid로 파일 저장하기,
  //todo: s3/temp/uuid_wm로 파일 저장하기
  @ApiCreateVideoS3()
  @UseInterceptors(MulterLocalVideoUpload())
  async createVideoS3(@UploadedFile() movie: Express.Multer.File) {
    // 3001번 포트 서버, WatermarkGenerationProcess
    await this.watermarkQueue.add('watermark', {
      videoId: movie.filename,
      videoPath: movie.path,
      watermarkPath: join(
        process.cwd(),
        'public',
        'watermark',
        'watermark1.png',
      ),
    });

    // await this.thumbnailQueue.add(
    //   'thumbnail',
    //   {
    //     videoId: movie.filename,
    //     videoPath: movie.path,
    //   },
    //   // {
    //   //   priority: 1, //낮을수록 우선순위가 높다.
    //   //   delay: 100, //ms만큼 기다렸다 실행해라
    //   //   attempts: 3, //실패시 n번까지 실행해라
    //   //   lifo: true, //queue를 stack처럼 실행한다.
    //   //   removeOnComplete: true, //작업 성공시 작업내용을 지운다.
    //   //   removeOnFail: true, //작업 실패시 작업내용을 지운다.
    //   // },
    // );
    return {
      filename: movie.filename,
    };
  }

  @Put('video/multer-s3/publish')
  //todo: swagger 작성
  async publishVideoS3() {}

  @Post('video/multer')
  @ApiCreateVideo()
  @UseInterceptors(MulterLocalVideoUpload())
  async createVideo(@UploadedFile() movie: Express.Multer.File) {
    // 3001번 포트 서버, WatermarkGenerationProcess

    await this.watermarkQueue.add('watermark', {
      videoId: movie.filename,
      videoPath: movie.path,
      watermarkPath: join(
        process.cwd(),
        'public',
        'watermark',
        'watermark1.png',
      ),
    });

    // await this.thumbnailQueue.add(
    //   'thumbnail',
    //   {
    //     videoId: movie.filename,
    //     videoPath: movie.path,
    //   },
    //   // {
    //   //   priority: 1, //낮을수록 우선순위가 높다.
    //   //   delay: 100, //ms만큼 기다렸다 실행해라
    //   //   attempts: 3, //실패시 n번까지 실행해라
    //   //   lifo: true, //queue를 stack처럼 실행한다.
    //   //   removeOnComplete: true, //작업 성공시 작업내용을 지운다.
    //   //   removeOnFail: true, //작업 실패시 작업내용을 지운다.
    //   // },
    // );
    return {
      filename: movie.filename,
    };
  }

  @Put('video/multer/publish')
  @ApiPublishVideo()
  async publishVideo(
    @Body() body: UpdateLocalFilePathDto,
    @Req() request: Request,
  ) {
    return this.multerService.renameMovieFile(body.filename, request);
  }

  //todo: publish/movie/uuid까지의 파일경로 리스트 불러오기
  async getStaticVideo() {}
}
