import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from '../director/entity/director.entity';
import { Genre } from '../genre/entities/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from '../common/common.service';

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
    private readonly dataSource: DataSource,

    private readonly commonService: CommonService,
  ) {}

  async findAll(dto: GetMoviesDto) {
    // const { title, take, page } = dto;

    const { title } = dto;
    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title Like :title', { title: `%${title}%` });
    }

    // this.commonService.applyPagePaginationParamsToQb(qb, dto);
    const { nextCursor } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    const [data, count] = await qb.getManyAndCount();

    return { data, nextCursor, count };
  }

  async findOne(id: number) {
    const movie = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.movieDetail', 'movieDetail')
      .where('movie.id = :id')
      .setParameter('id', id)
      .getOne();

    // const movie = await this.movieRepository.findOne({
    //   where: { id },
    //   relations: ['movieDetail', 'director', 'genres'],
    // });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 id의 영화입니다.');
    }

    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {
    const director = await this.directorRepository.findOne({
      where: { id: createMovieDto.directorId },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않은 id의 감독입니다.');
    }

    const genres = await this.genreRepository.find({
      where: {
        id: In(createMovieDto.genreIds),
      },
    });

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException(
        `존재하지 않는 장르가 있습니다! ids -> ${genres.map((genre) => genre.id).join(',')}`,
      );
    }
    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      movieDetail: { detail: createMovieDto.detail },
      director,
      genres,
    });

    //쿼리빌더 사용시
    /**
     * 1. movieDetail을 insert values(detail값 입력)후 execute()
     * 2. 1의 결과값에 identifiers[0].id로 생성한 값 1개의 id를 가져온다.
     * 3. movie를 insert values(title, detail(2의 id 입력), director 입력)
     * 4. manyToMany 는 쿼리빌더에서 그냥 안된다(엔티티 양쪽에 cascade 인 경우)
     * 5. movie queryBuilder에서 relation(Movie, 'genres')설정
     * 6. 3 에서 생성값의 identifier[0].id를 of에 입력
     * 7. .add(genres.map(g => g.id), director.map(d=>d.id)한다.
     * 8. movieRepository 를 fidnOne, relations:['detail','genres','director']를 불러온다.
     * 9. 트랜잭션 이슈 발생하니 관련작업 필요
     * */

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const movie = await qr.manager.findOne(Movie, {
        where: { id },
        relations: ['movieDetail', 'genres'],
      });

      if (!movie) {
        throw new NotFoundException('존재하지 않는 영화의 id 입니다.');
      }

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
        .update(movie)
        .set(movieUpdateFields)
        .where('id= :id', { id })
        .execute();

      if (detail) {
        await qr.manager
          .createQueryBuilder()
          .update('movieDetail')
          .set({ detail: detail })
          .where('movieDetail.id= :id', { id })
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

      // const newMovie = await this.movieRepository.findOne({
      //   where: { id },
      //   relations: ['movieDetail', 'director'],
      // });
      //
      // newMovie.genres = newGenres;
      // await this.movieRepository.save(newMovie);

      await qr.commitTransaction();

      return await this.movieRepository.findOne({
        where: { id },
        relations: ['movieDetail', 'director', 'genres'],
      });
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async remove(id: number) {
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
    return id;
  }
}
