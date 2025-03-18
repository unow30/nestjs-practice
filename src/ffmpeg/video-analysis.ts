import * as ffmpegFluent from 'fluent-ffmpeg';

// 비율별 설정 매핑 객체
export const RATIO_CONFIG = {
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

/**
 * 비디오 파일의 가로, 세로 크기를 가져옵니다.
 * @param path 비디오 파일 경로
 * @returns 비디오의 가로, 세로 크기
 */
export async function getVideoDimensions(
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

/**
 * 비디오의 비율 유형을 결정합니다.
 * @param width 비디오 가로 크기
 * @param height 비디오 세로 크기
 * @returns 비율 유형 (RATIO_CONFIG의 키 값)
 */
export function determineRatioType(
  width: number,
  height: number,
): keyof typeof RATIO_CONFIG {
  const ratio = width / height;
  const matched = Object.entries(RATIO_CONFIG).find(([key, _]) => {
    const [w, h] = key.split(':').map(Number);
    return Math.abs(ratio - w / h) < 0.1;
  });
  return matched ? (matched[0] as keyof typeof RATIO_CONFIG) : '16:9';
}

/**
 * 비디오 비율에 따른 워터마크 설정값을 계산합니다.
 * @param ratioType 비율 유형
 * @param width 비디오 가로 크기
 * @param height 비디오 세로 크기
 * @returns 크기 및 위치 설정
 */
export function calculateParams(
  ratioType: keyof typeof RATIO_CONFIG,
  width: number,
  height: number,
) {
  const shorterSide = Math.min(width, height);
  const size =
    Math.round((shorterSide * RATIO_CONFIG[ratioType].size) / 10) * 10;
  return { size, position: RATIO_CONFIG[ratioType].position };
}
