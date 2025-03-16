import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ClassSerializerInterceptor,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Public } from '../auth/decorator/public.decorator';
import { Role } from '../user/entity/user.entity';
import { RBAC } from '../auth/decorator/rbac.decorator';
import { GetMoviesDto } from './dto/get-movies.dto';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { UserId } from '../user/decorator/user-id.decorator';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import {
  CacheInterceptor as CI,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';
import { Throttle } from '../common/decorator/throttle.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('movie')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor) //class transformer를 movie controller에 적용하겠다.
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: '영화 리스트 보기',
    description: `
  ## cursor pagination
  - ### movie entity의 칼럼명에 오름차순, 내림차순을 입력하여 정렬한다.
  - ### ex:['id_DESC'], ['id_DESC', 'title_ASC', 'likeCount_DESC']
  - ### cursor값을 받아 입력하면 다음 패이징한 값을 받을 수 있다.
  - ### cursor는 base64로 인코딩되며 클라이언트가 이를 해석할 필요 없다.`,
  })
  // @Throttle({ count: 1, unit: 'minute' })
  getMovies(@Query() dto: GetMoviesDto, @UserId() userId: number) {
    return this.movieService.findAll(dto, userId);
  }

  //movie/recent
  @Get('recent')
  @UseInterceptors(CI)
  @CacheKey('getMoviesRecent')
  @CacheTTL(1000 * 60 * 10)
  @ApiOperation({
    summary: '최신 영화 리스트 보기',
    description: `
  ## 생성일자 기준 내림차순으로 영화 정렬하기
  ## 처음 불러온 데이터를 5분동안 캐싱(Cache Manager)`,
  })
  getMovieRecent() {
    return this.movieService.findRecent();
  }

  //movie/(number)
  @Get(':id')
  @ApiOperation({
    summary: '영화 선택하기',
    description: `
  선택한 영화는 캐싱되어 'api movie/my-pick' 에서 확인 가능 (Cache Manager)`,
  })
  @Public()
  getMovie(@Param('id', ParseIntPipe) id: number, @UserId() userId: number) {
    return this.movieService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({
    summary: '영화 생성하기',
    description: `
  ## admin 권한 유저만 가능
  ## movieFileName에 업로드로 변경된 비디오 파일명을 적는다.(uuid)
  ## dev환경: post common/video로 업로드한 파일위치를 변경하면서 파일명 저장
  - ### 서버의 public/temp 폴더에 저장된 파일이 public/movie로 이동
  ## prod환경: post common/presigned-url로 업로드한 파일명을 저장하면서 s3 파일경로변경
  - ### s3 bucket temp 폴더에 저장된 파일이 movie 폴더로 이동`,
  })
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  postMovie(
    @Body() body: CreateMovieDto,
    @QueryRunner() queryRunner: QR,
    @UserId() userId: number,
  ) {
    return this.movieService.create(body, queryRunner, userId);
  }

  @Patch(':id')
  @RBAC(Role.admin)
  @ApiOperation({
    summary: '영화 수정하기',
    description: `
  ## admin 권한 유저만 가능
  ## 영화제목, 상세내용, 감독, 장르, 파일명 변경 가능
  ## s3에 업로드한 파일정보를 변경한다.`,
  })
  patchMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(id, body);
  }

  @Delete(':id')
  @RBAC(Role.admin)
  @ApiOperation({
    summary: '영화 삭제하기',
    description: `
  ## admin 권한 유저만 가능`,
  })
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.remove(id);
  }

  @Post(':id/like')
  @ApiOperation({
    summary: '영화 좋아요',
    description: `
  ## movie/:id 에서 좋아요 여부 확인 가능
  ## 좋아요를 처음 누른 상태면 이를 생성한다.
  ## 좋아요를 다시 누르면 이를 제거한다.
  ## 싫어요를 누르면 싫어요로 변경한다.`,
  })
  createMovieLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(userId, movieId, true);
  }

  @Post(':id/dislike')
  @ApiOperation({
    summary: '영화 싫어요',
    description: `
  ## movie/:id 에서 좋아요 여부 확인 가능
  ## 싫어요를 처음 누른 상태면 이를 생성된다.
  ## 싫어요를 다시 누르면 이를 제거한다.
  ## 좋아요를 누르면 좋아요로 변경한다.`,
  })
  createMovieDislike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(userId, movieId, false);
  }
}
