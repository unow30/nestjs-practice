import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { join } from 'path';
import * as ffmpgeFluent from 'fluent-ffmpeg';

@Processor({ name: 'thumbnail-generation' })
export class ThumbnailGenerationProcess extends WorkerHost {
  async process(job: Job, token?: string) {
    const { videoPath, videoId } = job.data;
    console.log(job.data);

    console.log(`영상 트랜스코딩 중 ID:${videoId}`);
    const filename = videoId.split('.')[0];
    const outputDirectory = join(process.cwd(), 'public', 'thumbnail');

    ffmpgeFluent(videoPath)
      .screenshots({
        count: 1,
        filename: `${filename}.png`,
        folder: outputDirectory,
        size: '320x240',
      })
      .on('end', () => {
        console.log(`썸네일 생성 완료 ID:${videoId}`);
      })
      .on('error', (err) => {
        console.log(err);
        console.log(`썸네일 생성 실패 ID:${videoId}`);
      });

    return 0;

    // throw new Error('Method not implemented.');
  }
}
