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
    //메시지 큐(reids)를 연결하기
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>(envVariableKeys.redisHost),
          port: configService.get<number>(envVariableKeys.redisPort),
          username: configService.get<string>(envVariableKeys.redisUsername),
          password: configService.get<string>(envVariableKeys.redisPassword),
        },
      }),
    }),
    //bullmq에 등록할 프로세스 세팅
    BullModule.registerQueue({
      name: 'thumbnail-generation',
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService, TasksService, DefaultLogger],
  exports: [CommonService, DefaultLogger],
})
export class CommonModule {}
