import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as ffmpeg from '@ffmpeg-installer/ffmpeg';
import * as ffmpegFluent from 'fluent-ffmpeg';
import * as ffprobe from 'ffprobe-static';
import * as fs from 'fs';
import { join } from 'path';

const markdownContent = fs.readFileSync(
  join(process.cwd(), 'src', 'document', 'swagger-readme.md'),
  'utf8',
);
// test
ffmpegFluent.setFfmpegPath(ffmpeg.path);
ffmpegFluent.setFfprobePath(ffprobe.path);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false, // 기본 NestJS Logger 비활성화 ㅁ
  });

  // URI 버전 관리 활성화
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // CORS 설정 추가
  app.enableCors({
    origin: [
      'http://localhost:3010',
      'http://ceramic-tager.store.s3-website.ap-northeast-2.amazonaws.com',
      'https://www.ceramic-tager.store',
      'https://ceramic-tager.store',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('netflix test')
    .setDescription(markdownContent)
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // API 태그 순서 지정
  const customTagsOrder = [
    'auth',
    'user',
    'common',
    'genre',
    'director',
    'movie',
    'health',
  ];
  
  // 명시적으로 tags 배열 재정렬
  if (document.tags) {
    document.tags.sort((a, b) => {
      const aIndex = customTagsOrder.indexOf(a.name);
      const bIndex = customTagsOrder.indexOf(b.name);

      // 목록에 없는 태그는 맨 뒤로
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }

  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha', // 클라이언트 측에서는 단순히 알파벳 순 정렬 유지
      operationsSorter: 'alpha',
    },
  });

  //  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, //true 면 정의하지 않은 값도 전달이 가능하다.
      forbidNonWhitelisted: true, //true 면 있으면 안되는 프로퍼티를 감지한다.
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
