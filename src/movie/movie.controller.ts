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
import {
  ApiGetMovieRecent,
  ApiCreateMovieLike,
  ApiDeleteMovie,
  ApiGetMovie,
  ApiPatchMovie,
  ApiPostMovie,
  ApiGetMovies,
} from '../document/decorator/movie-api.decorator';
import {
  MovieListRecentDto,
  MovieListResponseDto,
  MovieDto,
} from './dto/response/movie.dto';

@Controller('movie')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor) //class transformer를 movie controller에 적용하겠다.
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @Public()
  @ApiGetMovies()
  // @Throttle({ count: 1, unit: 'minute' })
  getMovies(
    @Query() dto: GetMoviesDto,
    @UserId() userId: number,
  ): Promise<MovieListResponseDto> {
    return this.movieService.findAll(dto, userId);
  }

  @Get('recent')
  @UseInterceptors(CI)
  @CacheKey('getMoviesRecent')
  @CacheTTL(1000 * 60 * 10)
  @ApiGetMovieRecent()
  getMovieRecent(): Promise<MovieListRecentDto[]> {
    return this.movieService.findRecent();
  }

  @Get(':id')
  @ApiGetMovie()
  @Public()
  getMovie(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: number,
  ): Promise<MovieDto> {
    return this.movieService.findOne(id, userId);
  }

  @Post()
  @ApiPostMovie()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  postMovie(
    @Body() body: CreateMovieDto,
    @QueryRunner() queryRunner: QR,
    @UserId() userId: number,
  ): Promise<MovieDto> {
    return this.movieService.create(body, queryRunner, userId);
  }

  @Patch(':id')
  @RBAC(Role.admin)
  @ApiPatchMovie()
  patchMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMovieDto,
  ): Promise<MovieDto> {
    return this.movieService.update(id, body);
  }

  @Delete(':id')
  @RBAC(Role.admin)
  @ApiDeleteMovie()
  deleteMovie(@Param('id', ParseIntPipe) id: number): Promise<{ id: number }> {
    return this.movieService.remove(id);
  }

  @Post(':id/like')
  @ApiCreateMovieLike()
  createMovieLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ): Promise<{ isLike: boolean | null }> {
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
