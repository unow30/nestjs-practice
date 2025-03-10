import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommonService } from './common.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Controller('common')
@ApiBearerAuth()
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    @InjectQueue('thumbnail-generation')
    private readonly thumbnailQueue: Queue,
  ) {}

  @Post('/presigned-url')
  async createPresignedUrl() {
    return {
      url: await this.commonService.createPresignedUrl(),
    };
  }

  @Post('video')
  @UseInterceptors(
    FileInterceptor('video', {
      limits: { fileSize: 200000000 },
      fileFilter(req, file, callback) {
        if (file.mimetype !== 'video/mp4') {
          return callback(
            new BadRequestException('mp4타입만 업로드 가능합니다.'),
            false,
          );
        }
        return callback(null, true);
      },
    }),
  )
  async createVideo(@UploadedFile() movie: Express.Multer.File) {
    await this.thumbnailQueue.add(
      'thumbnail',
      {
        videoId: movie.filename,
        videoPath: movie.path,
      },
      // {
      //   priority: 1, //낮을수록 우선순위가 높다.
      //   delay: 100, //ms만큼 기다렸다 실행해라
      //   attempts: 3, //실패시 n번까지 실행해라
      //   lifo: true, //queue를 stack처럼 실행한다.
      //   removeOnComplete: true, //작업 성공시 작업내용을 지운다.
      //   removeOnFail: true, //작업 실패시 작업내용을 지운다.
      // },
    );
    return {
      filename: movie.filename,
    };
  }
}
