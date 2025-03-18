import { ThumbnailGenerationProcess } from './thumbnail-generation.worker';
import { Module } from '@nestjs/common';
import { WatermarkGenerationProcess } from './watermark-generation.process';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module';
@Module({
  imports: [FfmpegModule],
  providers: [ThumbnailGenerationProcess, WatermarkGenerationProcess],
})
export class WorkerModule {}
