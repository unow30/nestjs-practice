import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
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

ffmpegFluent.setFfmpegPath(ffmpeg.path);
ffmpegFluent.setFfprobePath(ffprobe.path);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // logger: false, // 기본 NestJS Logger 비활성화 ㅁ
  });

  const config = new DocumentBuilder()
    .setTitle('netflix test')
    .setDescription(markdownContent)
    .setVersion('1.0')
    .addBasicAuth()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
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
