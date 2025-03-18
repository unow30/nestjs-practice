import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { join } from 'path';
import * as ffmpegFluent from 'fluent-ffmpeg';
import { rename } from 'fs/promises';

// 비율별 설정 매핑 객체
const RATIO_CONFIG = {
  '1:1': {
    size: 0.1,
    position: ['main_w-overlay_w-20', 'main_h-overlay_h-20'],
  },
  '3:4': { size: 0.08, position: ['20', 'main_h-overlay_h-20'] },
  '4:3': { size: 0.07, position: ['main_w-overlay_w-20', '20'] },
  '16:9': {
    size: 0.05,
    position: ['main_w-overlay_w-20', 'main_h-overlay_h-20'],
  },
  '9:16': {
    size: 0.06,
    position: ['(main_w-overlay_w)/2', 'main_h-overlay_h-20'],
  },
};

@Processor({ name: 'watermark-generation' })
export class WatermarkGenerationProcess extends WorkerHost {
  async process(job: Job) {
    const { videoId, videoPath, watermarkPath } = job.data;
    const outputDir = join(process.cwd(), 'public', 'temp');
    // const outputDir = join(process.cwd(), 'public', 'movie');
    const outputFile = `${videoId.split('.')[0]}_wm_processing.mp4`;

    try {
      const { width, height } = await this.getVideoDimensions(videoPath);
      const ratioType = this.determineRatioType(width, height);
      const { size, position } = this.calculateParams(ratioType, width, height);

      return this.processVideo(
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

  private processVideo(
    inputPath: string,
    watermarkPath: string,
    outputPath: string,
    size: number,
    [x, y]: string[],
  ): Promise<any> {
    console.log('ffmpeg 시작');

    let lastFrameCount = 0;
    return new Promise((resolve, reject) => {
      ffmpegFluent()
        .input(inputPath)
        .input(watermarkPath)
        .complexFilter([
          `[1:v]scale=${size}:${size}[wm]`,
          `[0:v][wm]overlay=${x}:${y}`,
        ])
        .outputOptions('-c:a copy')
        .output(outputPath)
        .on('progress', (progress) => {
          lastFrameCount += progress.frames;
          console.log(`진행률: ${Math.floor(progress.percent)}%`);
          console.log(`처리 프레임: ${progress.frames}`);
        })
        .on('end', () => {
          console.log('end stream');
          console.log('진행률: 100%');
          console.log(`처리 프레임: ${lastFrameCount}`);
          
          // 파일 이름 변경
          const finalOutputPath = outputPath.replace('_wm_processing', '_wm');
          rename(outputPath, finalOutputPath)
            .then(() => resolve({ outputPath: finalOutputPath }))
            .catch(reject);
          
        })
        .on('error', reject)
        .run();
    });
  }

  private async getVideoDimensions(
    path: string,
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      ffmpegFluent.ffprobe(path, (err, metadata) => {
        if (err) reject(err);
        const videoStream = metadata.streams.find(
          (s) => s.codec_type === 'video',
        );
        resolve({ width: videoStream.width, height: videoStream.height });
      });
    });
  }

  private determineRatioType(
    width: number,
    height: number,
  ): keyof typeof RATIO_CONFIG {
    const ratio = width / height;
    const matched = Object.entries(RATIO_CONFIG).find(([_, cfg]) => {
      const [w, h] = _.split(':').map(Number);
      return Math.abs(ratio - w / h) < 0.1;
    });
    return matched ? (matched[0] as keyof typeof RATIO_CONFIG) : '16:9';
  }

  private calculateParams(
    ratioType: keyof typeof RATIO_CONFIG,
    width: number,
    height: number,
  ) {
    const shorterSide = Math.min(width, height);
    const size =
      Math.round((shorterSide * RATIO_CONFIG[ratioType].size) / 10) * 10;
    return { size, position: RATIO_CONFIG[ratioType].position };
  }
}
