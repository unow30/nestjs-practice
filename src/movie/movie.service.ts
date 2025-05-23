import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from '../director/entity/director.entity';
import { Genre } from '../genre/entity/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from '../common/common.service';
import { User } from '../user/entity/user.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CursorPaginationService } from '../common/cursor-pagination.service';
import {
  MovieListRecentDto,
  MovieListResponseDto,
  MovieDto,
  MovieListItemDto,
} from './dto/response/movie.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
    private readonly cursorPaginationService: CursorPaginationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findRecent(): Promise<MovieListRecentDto[]> {
    const cacheData: MovieListRecentDto[] =
      await this.cacheManager.get('MOVIE_RECENT');
    if (cacheData) {
      return cacheData;
    }

    const data: MovieListRecentDto[] = await this.movieRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 10,
    });

    await this.cacheManager.set('MOVIE_RECENT', data, 300000);

    return data;
  }

  async findAll(
    dto: GetMoviesDto,
    userId: number,
  ): Promise<MovieListResponseDto> {
    const { title } = dto;
    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title Like :title', { title: `%${title}%` });
    }

    const { nextCursor } =
      await this.cursorPaginationService.applyCursorPaginationParamsToQb(
        qb,
        dto,
      );

    // eslint-disable-next-line prefer-const
    let [data, count] = await qb.getManyAndCount();

    if (userId) {
      const movieIds = data.map((movie) => movie.id);

      const likeMovies =
        movieIds.length < 1
          ? []
          : await this.movieUserLikeRepository
              .createQueryBuilder('mul')
              .leftJoinAndSelect('mul.user', 'user')
              .leftJoinAndSelect('mul.movie', 'movie')
              .where('movie.id in(:...movieIds)', { movieIds })
              .andWhere('user.id = :userId', { userId })
              .getMany();

      /**
       * {
       *  movieId: boolean
       * }
       */
      const likedMovieMap = likeMovies.reduce(
        (acc, next) => ({
          ...acc,
          [next.movie.id]: next.isLike,
        }),
        {},
      );

      data = data.map((x) => {
        const originalMovieFileName = x.movieFileName;

        const transformed = plainToInstance(Movie, {
          ...x,
          likeStatus: x.id in likedMovieMap ? likedMovieMap[x.id] : null,
        });

        if (
          originalMovieFileName &&
          typeof originalMovieFileName === 'string' &&
          originalMovieFileName.includes('cloudfront.net')
        ) {
          transformed.movieFileName = originalMovieFileName;
        }

        return transformed;
      });
    }

    return { data: data, nextCursor, count };
  }

  // async findOne(id: number, userId: number): Promise<MovieListResponseDto> {
  async findOne(id: number, userId: number): Promise<MovieListItemDto> {
    const movie = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.movieDetail', 'movieDetail')
      .where('movie.id = :id')
      .setParameter('id', id)
      .getOne();

    if (!movie) {
      throw new NotFoundException('존재하지 않는 id의 영화입니다.');
    }

    const likeUser = await this.movieUserLikeRepository
      .createQueryBuilder('like')
      .select('like.isLike')
      .where('like.movie.id = :id', { id: movie.id })
      .andWhere('like.user.id = :userId', { userId: userId })
      .getOne();

    if (likeUser) {
      movie['isLike'] = likeUser['isLike'];
    }

    const myPick = await this.cacheManager.get(`my-pick${userId}`);

    const myPickArr: Movie[] = Array.isArray(myPick) ? myPick : [];

    const movieExists = myPickArr.some((m) => m.id === movie.id);

    if (!movieExists) {
      await this.cacheManager.set(
        `my-pick${userId}`,
        [...myPickArr, movie],
        300000,
      );
    } else {
      await this.cacheManager.set(`my-pick${userId}`, myPickArr, 300000);
    }

    return movie;
  }

  async create(
    createMovieDto: CreateMovieDto,
    qr: QueryRunner,
    userId: number,
  ): Promise<MovieDto> {
    const director = await qr.manager.findOne(Director, {
      where: { id: createMovieDto.directorId },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않은 id의 감독입니다.');
    }

    const genres = await qr.manager.find(Genre, {
      where: {
        id: In(createMovieDto.genreIds),
      },
    });

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException(
        `존재하지 않는 장르가 있습니다! ids -> ${genres.map((genre) => genre.id).join(',')}`,
      );
    }

    const movieExist = await qr.manager.findOne(Movie, {
      where: { title: createMovieDto.title },
    });

    if (movieExist) {
      throw new NotFoundException(
        `이미 존재하는 영화재목입니다! title -> ${movieExist.title}`,
      );
    }

    const movieDetail = await qr.manager
      .createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({ detail: createMovieDto.detail })
      .execute();

    const movieDetailId = movieDetail.identifiers[0].id;

    const movie = await qr.manager
      .createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title: createMovieDto.title,
        movieDetail: { id: movieDetailId },
        director,
        creator: { id: userId },
        movieFileName: createMovieDto.movieFileName,
      })
      .execute();

    const movieId = movie.identifiers[0].id;

    await qr.manager
      .createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movieId)
      .add(genres.map((genre) => genre.id));

    await this.commonService.saveMovieToPermanentStorage(
      createMovieDto.movieFileName,
    );

    return qr.manager.findOne(Movie, {
      where: { id: movieId },
      relations: ['movieDetail', 'director', 'genres'],
    });
  }

  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<MovieDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const movie = await qr.manager.findOne(Movie, {
        where: { id },
        relations: ['movieDetail', 'genres'],
      });

      if (!movie) {
        throw new NotFoundException('존재하지 않는 영화의 id 입니다!');
      }

      const movieDetailId = movie.movieDetail.id;
      const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

      let newDirector;
      if (directorId) {
        const director = await qr.manager.findOne(Director, {
          where: { id: directorId },
        });

        if (!director) {
          throw new NotFoundException('존재하지 않는 감독의 id 입니다.');
        }

        newDirector = director;
      }

      let newGenres;
      if (genreIds) {
        const genres = await qr.manager.find(Genre, {
          where: { id: In(genreIds) },
        });

        if (genres.length !== genreIds.length) {
          new NotFoundException(
            `존재하지 않는 장르가 있습니다! ids -> ${genres.map((genre) => genre.id).join(',')}`,
          );
        }
        newGenres = genres;
      }

      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && { director: newDirector }),
      };

      await qr.manager
        .createQueryBuilder()
        .update(Movie)
        .set(movieUpdateFields)
        .where('id= :id', { id })
        .execute();

      if (detail) {
        await qr.manager
          .createQueryBuilder()
          .update(MovieDetail)
          .set({ detail: detail })
          .where('id= :id', { id: movieDetailId })
          .execute();
      }

      if (newGenres) {
        await qr.manager
          .createQueryBuilder()
          .relation(Movie, 'genres')
          .of(id)
          .addAndRemove(
            newGenres.map((genre) => genre.id),
            movie.genres.map((genre) => genre.id),
          );
      }

      await qr.commitTransaction();

      return await this.movieRepository.findOne({
        where: { id },
        relations: ['movieDetail', 'director', 'genres'],
      });
    } catch (e) {
      console.error(e);
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async remove(id: number): Promise<{ id: number }> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieDetail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 id입니다.');
    }

    await this.movieRepository
      .createQueryBuilder('movie')
      .delete()
      .where('id= :id', { id })
      .execute();
    // await this.movieRepository.delete(id);

    // await this.movieDetailRepository.delete(movie.detail.id);
    await this.movieDetailRepository.delete(movie.movieDetail.id);
    return { id };
  }

  async toggleMovieLike(
    userId: number,
    movieId: number,
    isLike: boolean,
  ): Promise<{ isLike: boolean | null }> {
    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
    });

    if (!movie) {
      throw new BadRequestException('존재하지 않는 영화입니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('사용자 정보가 없습니다.');
    }

    const likeRecode = await this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id= :movieId', { movieId })
      .andWhere('user.id= :userId', { userId })
      .getOne();

    if (likeRecode) {
      if (isLike === likeRecode.isLike) {
        await this.movieUserLikeRepository.delete({ movie, user });
      } else {
        await this.movieUserLikeRepository.update(
          {
            movie,
            user,
          },
          { isLike },
        );
      }
    } else {
      await this.movieUserLikeRepository.save({ movie, user, isLike });
    }

    const result = await this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id= :movieId', { movieId })
      .andWhere('user.id= :userId', { userId })
      .getOne();

    return {
      isLike: result && result.isLike,
    };
  }
}
