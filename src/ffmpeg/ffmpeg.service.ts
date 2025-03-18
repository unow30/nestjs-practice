import { Injectable } from '@nestjs/common';
import * as ffmpegFluent from 'fluent-ffmpeg';
import { rename } from 'fs/promises';

@Injectable()
export class FfmpegService {
  processVideo(
    inputPath: string,
    watermarkPath: string,
    outputPath: string,
    size: number,
    position: string[],
  ): Promise<any> {
    console.log('ffmpeg 시작');
    const [x, y] = position;

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
}
