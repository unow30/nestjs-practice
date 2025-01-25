import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from '../director/entity/director.entity';
import { Genre } from '../genre/entities/genre.entity';

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
  ) {}

  async findAll(title?: string) {
    ///title 필터 기능 추가하기
    if (!title) {
      return [
        await this.movieRepository.find({
          relations: ['director', 'genre'],
        }),
        await this.movieRepository.count(),
      ];
    }

    return this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`),
      },
      relations: ['director', 'genres'],
    });
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieDetail', 'director', 'genres'],
    });

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

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieDetail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 영화의 id 입니다.');
    }

    const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

    let newDirector;
    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: { id: directorId },
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 감독의 id 입니다.');
      }

      newDirector = director;
    }

    let newGenres;
    if (genreIds) {
      const genres = await this.genreRepository.find({
        where: { id: In(genreIds) },
      });

      if (genres.length !== genreIds.length) {
        throw new NotFoundException(
          `존재하지 않는 장르가 있습니다! ids -> ${genres.map((genre) => genre.id).join(',')}`,
        );
      }
      newGenres = genres;
    }

    const movieUpdateFields = {
      ...movieRest,
      ...(newDirector && { director: newDirector }),
    };

    await this.movieRepository.update({ id }, movieUpdateFields);

    if (detail) {
      await this.movieDetailRepository.update(
        // { id: movie.detail.id },
        { id: movie.movieDetail.id },
        { detail },
      );
    }

    const newMovie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieDetail', 'director'],
    });

    newMovie.genres = newGenres;
    await this.movieRepository.save(newMovie);

    return await this.movieRepository.findOne({
      where: { id },
      relations: ['movieDetail', 'director', 'genres'],
    });
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieDetail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 id입니다.');
    }

    await this.movieRepository.delete(id);

    // await this.movieDetailRepository.delete(movie.detail.id);
    await this.movieDetailRepository.delete(movie.movieDetail.id);
    return id;
  }
}
