import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, //true면 정의하지 않은 값도 전달이 가능하다.
      forbidNonWhitelisted: true, //true 면 있으면 안되는 프로퍼티를 감지한다.
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
