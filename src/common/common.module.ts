import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from '../movie/entity/movie.entity';
import { DefaultLogger } from './logger/default.logger';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from './const/env.const';
import { MulterService } from './multer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie]),
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'temp'),
        filename(req, file, cb) {
          const split = file.originalname.split('.');

          let ext = 'mp4';
          if (split.length > 1) {
            ext = split[split.length - 1];
          }

          cb(null, `${v4()}_${Date.now()}.${ext}`);
        },
      }),
    }),
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
  providers: [CommonService, TasksService, MulterService, DefaultLogger],
  exports: [CommonService, DefaultLogger],
})
export class CommonModule {}
