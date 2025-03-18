import { ThumbnailGenerationProcess } from './thumbnail-generation.worker';
import { Module } from '@nestjs/common';
import { WatermarkGenerationProcess } from './watermark-generation.process';
@Module({
  imports: [],
  providers: [ThumbnailGenerationProcess, WatermarkGenerationProcess],
})
export class WorkerModule {}
