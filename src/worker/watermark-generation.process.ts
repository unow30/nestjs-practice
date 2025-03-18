import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { join } from 'path';
import { Injectable } from '@nestjs/common';
import { FfmpegService } from '../ffmpeg/ffmpeg.service';
import {
  getVideoDimensions,
  determineRatioType,
  calculateParams,
} from '../ffmpeg/video-analysis';

@Processor({ name: 'watermark-generation' })
@Injectable()
export class WatermarkGenerationProcess extends WorkerHost {
  constructor(private readonly ffmpegService: FfmpegService) {
    super();
  }

  async process(job: Job) {
    const { videoId, videoPath, watermarkPath } = job.data;
    const outputDir = join(process.cwd(), 'public', 'temp');
    // const outputDir = join(process.cwd(), 'public', 'movie');
    const outputFile = `${videoId.split('.')[0]}_wm_processing.mp4`;

    try {
      // 비디오 분석 실행
      const { width, height } = await getVideoDimensions(videoPath);
      const ratioType = determineRatioType(width, height);
      const { size, position } = calculateParams(ratioType, width, height);

      // 비디오 처리 실행
      return this.ffmpegService.processVideo(
        videoPath,
        watermarkPath,
        join(outputDir, outputFile),
        size,
        position,
      );
    } catch (error) {
      console.error(`처리 실패 ID:${videoId}`, error);
      throw new Error('Video processing failed');
    }
  }
}
