import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommonService } from './common.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { UpdateLocalFilePathDto } from '../movie/dto/update-local-filepath.dto';
import { Request } from 'express';
import { MulterService } from './multer.service';
import { join } from 'path';

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
  @ApiOperation({
    summary: 'presigned url 생성',
    description: `
  ## 5분간 지속되는 s3 업로드 링크를 생성한다.
  ## 업로드 완료시 파일은 bucket-name/temp/filename(uuid)으로 저장한다.
  ## 영상 파일을 바이너리 형식으로 body에 담은 다음 해당 링크를 put 요청으로 실행한다.
  ## 성공시 1 true 반환하면 filename을 post movie movieFileName에 입력한다.
    `,
  })
  async createPresignedUrl() {
    return await this.commonService.createPresignedUrl();
  }

  @Post('multer/video')
  @ApiOperation({
    summary: '서버 폴더에 비디오 파일 업로드',
    description: `
  ## multer 단일파일 업로드 
  ## video/mp4만 업로드한다.
  ## 업로드시 public/temp/filename(uuid)로 저장된다.
  ### serve-static으로 파일 확인 가능
  ## 업로드 제한 용량은 일일 최대 50mb
  ## 썸네일은 bullmq의 Queue 기능으로 다른 서버에서 추출한다.
  ## 요청 성공시 put multer/video에 응답값인 filename을 입력한다.
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a file',
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary', // 파일 형식 명시
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('video', {
      limits: { fileSize: 100000000 },
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

  @Put('multer/publish')
  @ApiOperation({
    summary: '정적파일 배포상태로 변경',
    description: `
  ## serve-static으로 파일을 읽기 위해 지정한 경로로 업로드 파일 이동  
  ### 이동 성공시 해당 경로를 get 요청하여 파일 확인 가능 
  ### post multer/video 응답값인 filename을 입력한다.
    `,
  })
  async publishVideo(
    @Body() body: UpdateLocalFilePathDto,
    @Req() request: Request,
  ) {
    return this.multerService.renameMovieFile(body.filename, request);
  }
}
