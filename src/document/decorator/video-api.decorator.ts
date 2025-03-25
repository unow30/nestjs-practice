import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export function ApiCreatePresignedUrl() {
  return applyDecorators(
    ApiOperation({
      summary: 'presigned url 생성',
      description: `
  ## frontend 연계형 파일 업로드 방식
  ### - frontend에서 원본, 편집영상을 업로드한다고 가정한다.  
  ## 5분간 지속되는 s3 업로드 링크를 생성한다.
  ### - origin.mp4, wm.mp4 파일을 업로드하는 url을 2개 생성한다.
  ## 영상 파일을 바이너리 형식으로 body에 담은 다음 해당 링크를 put 요청으로 실행한다.
  ### - put요청 성공시 파일은 s3 bucket-name/public/temp/filename(uuid)으로 저장한다.
  ## 서버에서 파일 경로 변경 api를 실행하면 파일을 불러올 수 있다.
  ###  api 경로 작성, 입력값: filename(uuid)을 입력
  ### - s3 bucket-name/public/movie/uuid/origin.mp4
  ### - s3 bucket-name/public/movie/uuid/wm.mp4 
    `,
    }),
    ApiResponse({
      status: 201,
      description: 'presigned-url 생성 (원본 및 워터마크 비디오)',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                filename: {
                  type: 'string',
                  example: 'uuid.mp4',
                },
                url: {
                  type: 'string',
                  example: 'pre-signed-url-you-request-put',
                },
              },
            },
            example: [
              {
                filename: 'uuid.mp4',
                url: 'pre-signed-url-for-original-video',
              },
              {
                filename: 'uuid_wm.mp4',
                url: 'pre-signed-url-for-watermarked-video',
              },
            ],
          },
        },
      },
    }),
  );
}

export function ApiCreateVideoS3() {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Upload a file',
      schema: {
        type: 'object',
        properties: {
          video: {
            type: 'string',
            format: 'binary', // 파일 형식 명시
          },
        },
      },
    }),
    ApiOperation({
      summary: 'multer s3로 비디오 파일 업로드',
      description: `
  ## multer 단일파일 업로드 
  ## video/mp4만 업로드한다.
  ### - 업로드 성공시 s3 폴더의 public/temp/filename(uuid)로 저장된다.
  ## filename을 post /movie 요청의 body.movieFileName에 입력한다.
  ### - post 요청 성공시 파일은 s3 bucket-name/temp/uuid/origin.mp4로 저장된다.
    `,
    }),
  );
}

export function ApiCreateVideo() {
  return applyDecorators(
    ApiOperation({
      summary: '서버 폴더에 비디오 파일 업로드',
      description: `
  ## multer 단일파일 업로드 시연용
  ## video/mp4만 업로드한다.
  ## 업로드시 서버폴더의 public/temp에 파일명이 uuid로 저장된다.
  ### - 원본 미디어는 uuid.mp4로 저장한다.
  ### - 워터마크 미디어는 uuid_wm.mp4로 저장한다.
  ### - serve-static으로 폴더 경로 입력하여 파일 확인 가능
  ## 업로드 제한 용량은 최대 100mb
  ## bullmq의 Queue 기능으로 3001포트 서버에서 영상을 편집한다.
  ### - 썸네일 생성(작업 필요)
  ### - 워터마크 생성(작업 필요)
  ## 요청 성공시 put video/multer/publish에 응답값인 filename을 입력한다.
    `,
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Upload a file',
      schema: {
        type: 'object',
        properties: {
          video: {
            type: 'string',
            format: 'binary', // 파일 형식 명시
          },
        },
      },
    }),
  );
}

export function ApiPublishVideo() {
  return applyDecorators(
    ApiOperation({
      summary: '정적파일 배포상태로 변경',
      description: `
  ## multer 단일파일 업로드 시연용
  ## serve-static으로 파일을 읽기 위해 지정한 경로로 업로드 파일 이동
  ## 원본영상(temp)과 워터마크(watermarked)파일을 파일명과 동일한 폴더에 담아 movie 폴더로 이동한다.
  ### - public/movie/uuid/origin.mp4
  ### - public/movie/uuid/wm.mp4   
  ### - 워터마크 파일이 완전히 생성되어야 이동 가능하다.
  ### - 이동 성공시 해당 경로를 서버에 get 요청하여 파일 확인 가능
  ### - post multer/video 응답값인 filename을 입력한다.
    `,
    }),
    ApiResponse({
      status: 201,
      description: '정적파일 배포상태로 변경',
      schema: {
        type: 'object',
        properties: {
          originalPath: {
            type: 'string',
            example: 'http://server-url/folder/path/origin.mp4',
          },
          watermarkPath: {
            type: 'string',
            example: 'http://server-url/folder/path/wm.mp4',
          },
        },
      },
    }),
  );
}

export function ApiUserDelete() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 제거하기',
      description: `
## 사용자 정보 제거하기
## 로그인한 사용자 본인 제거하기
## 본인의 사용자 정보를 변경가능(로그인해야 사용 가능)
## 실제 사용자정보 drop`,
    }),
    ApiResponse({
      status: 200,
      description: '사용자 제거하기',
      schema: {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
            example: 'filename.mp4',
          },
        },
      },
    }),
  );
}
