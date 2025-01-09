import { Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';

@Module({
  imports: [MovieModule], //또다른 모듈, 기능을 이 모듈로 불러들일 때 사용
  exports: [], //이 모듈, 기능을 또다른 모듈로 내보낼 때 사용
  controllers: [],
  providers: [], //Ioc컨태이너에 injectable할 클래스
})
export class AppModule {}
