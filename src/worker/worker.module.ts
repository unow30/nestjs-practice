import { ThumbnailGenerationProcess } from './thumbnail-generation.worker';
import { Module } from '@nestjs/common';
import { WatermarkGenerationProcess } from './watermark-generation.process';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { envVariableKeys } from '../common/const/env.const';
@Module({
  imports: [
    //메시지 큐(redis)를 연결하기
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
  ],
  providers: [ThumbnailGenerationProcess, WatermarkGenerationProcess],
})
export class WorkerModule {}
