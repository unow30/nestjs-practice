import { ThumbnailGenerationProcess } from './thumbnail-heneration.worker';
import { Module } from '@nestjs/common';

@Module({ providers: [ThumbnailGenerationProcess] })
export class WorkerModule {}
