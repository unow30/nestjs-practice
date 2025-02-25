import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommonService } from './common.service';

@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

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
  createVideo(@UploadedFile() movie: Express.Multer.File) {
    return {
      filename: movie.filename,
    };
  }
}
