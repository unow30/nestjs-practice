import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Version,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { UpdateLocalFilePathDto } from '../movie/dto/update-local-filepath.dto';
import { Request } from 'express';
import { FileSystemService } from './fileSystem.service';
import { join } from 'path';
import { MulterLocalVideoUpload } from './interceptor/multer-video-upload.interceptor';
import {
  ApiCreatePresignedUrl,
  ApiCreateVideo,
  ApiPublishVideoS3,
  ApiPublishVideo,
  ApiGetStaticVideoPath,
  ApiCreatePresignedUrlV2,
} from '../document/decorator/video-api.decorator';
import * as fs from 'fs/promises';
import { PresignedUrlV2Dto } from './dto/presigned-url-v2.dto';

@Controller('common')
@ApiBearerAuth()
@ApiTags('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    private readonly fileSystemService: FileSystemService,
    @InjectQueue('watermark-generation')
    private readonly watermarkQueue: Queue,
    @InjectQueue('thumbnail-generation')
    private readonly thumbnailQueue: Queue,
  ) {}

  @Version('1')
  @Post('presigned-url')
  @ApiCreatePresignedUrl()
  async createPresignedUrl() {
    return await this.commonService.createPresignedUrl();
  }

  @Version('2')
  @Post('presigned-url')
  @ApiCreatePresignedUrlV2()
  async createPresignedUrlV2(@Body() presignedUrlV2Dto: PresignedUrlV2Dto) {
    return await this.commonService.createPresignedUrlV2(
      presignedUrlV2Dto.filename,
      presignedUrlV2Dto.contentType,
    );
  }

  @Post('video/multer')
  @ApiCreateVideo()
  @UseInterceptors(MulterLocalVideoUpload())
  async createVideo(@UploadedFile() movie: Express.Multer.File) {
    try {
      // 썸네일 작업 추가 (비동기로 처리)
      await this.thumbnailQueue.add('thumbnail', {
        videoId: movie.filename,
        videoPath: movie.path,
      });

      // 워터마크 큐에 작업 추가 (비동기로 처리)
      const jobId = await this.watermarkQueue.add('watermark', {
        videoId: movie.filename,
        videoPath: movie.path,
        watermarkPath: join(
          process.cwd(),
          'public',
          'watermark',
          'watermark1.png',
        ),
      });

      return {
        status: 'processing',
        message: '워터마크 처리가 진행 중입니다.',
        filename: movie.filename,
        jobId: jobId.id,
      };
    } catch (error) {
      console.error(`워터마크 처리 중 오류 발생: ${error.message}`);
      return {
        status: 'error',
        message: `워터마크 처리 중 오류가 발생했습니다: ${error.message}`,
        filename: movie.filename,
      };
    }
  }

  @Get('video/multer/:page/:pageSize')
  @ApiGetStaticVideoPath()
  async getStaticVideoPath(
    @Req() req: Request,
    @Param('page') page: number,
    @Param('pageSize') pageSize: number,
  ) {
    return await this.fileSystemService.getStaticVideoPath(req, page, pageSize);
  }

  @Put('video/multer/publish')
  @ApiPublishVideo()
  async publishVideo(
    @Body() body: UpdateLocalFilePathDto,
    @Req() request: Request,
  ) {
    return this.fileSystemService.renameMovieFile(body.filename, request);
  }

  @Put('video/multer/publish/s3')
  @ApiPublishVideoS3()
  async uploadToS3(@Body() body: UpdateLocalFilePathDto) {
    try {
      // 파일이 워터마크 처리가 완료되었는지 확인
      const filename = body.filename;
      const filenameWithoutExt = filename.includes('.')
        ? filename.substring(0, filename.lastIndexOf('.'))
        : filename;
      const ext = filename.includes('.')
        ? filename.substring(filename.lastIndexOf('.') + 1)
        : 'mp4';

      const watermarkFilename = `${filenameWithoutExt}_wm.${ext}`;
      const originalPath = join(process.cwd(), 'public', 'temp', filename);
      const watermarkPath = join(
        process.cwd(),
        'public',
        'temp',
        watermarkFilename,
      );

      // 원본 파일과 워터마크 파일이 존재하는지 확인
      try {
        await fs.access(originalPath);
      } catch (error) {
        console.error('origin file access error:', error);
        throw new BadRequestException(
          `원본 파일이 존재하지 않습니다: ${filename}`,
        );
      }

      try {
        await fs.access(watermarkPath);
      } catch (error) {
        console.error('watermark file access error:', error);
        throw new BadRequestException(
          `워터마크 파일이 아직 생성되지 않았습니다. 워터마크 처리가 완료될 때까지 기다려주세요.`,
        );
      }

      // S3에 원본 및 워터마크 파일 업로드
      const s3Urls = await this.commonService.uploadMovieFilesToS3(filename);

      return {
        status: 'success',
        message: 'S3 업로드가 완료되었습니다.',
        originalUrl: s3Urls.originalUrl,
        watermarkUrl: s3Urls.watermarkUrl,
      };
    } catch (error) {
      console.error(`S3 업로드 중 오류 발생: ${error.message}`);

      if (error instanceof BadRequestException) {
        throw error;
      }

      return {
        status: 'error',
        message: `S3 업로드 중 오류가 발생했습니다: ${error.message}`,
      };
    }
  }
}
