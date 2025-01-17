import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';

@Injectable()
export class MovieService {
  private movies: Movie[] = [];
  private idCounter = 3;

  constructor() {
    const movie1 = new Movie();
    movie1.id = 1;
    movie1.title = '해리포터';
    movie1.genre = '액션';

    const movie2 = new Movie();
    movie2.id = 2;
    movie2.title = '반지의재왕';
    movie2.genre = '판타지';

    this.movies.push(movie1, movie2);
  }

  getManyMovies(title?: string) {
    if (!title) {
      return this.movies;
    }
    return this.movies.filter((m) => m.title.startsWith(title));
  }

  getMovieById(id: number) {
    const movie = this.movies.find((m) => m.id === +id);
    if (!movie) {
      // throw new Error('존재하지 않는 id입니다.');
      throw new NotFoundException('존재하지 않는 id입니다.');
    }
    return movie;
  }

  createMovie(createMovieDto: CreateMovieDto) {
    const movie: Movie = {
      id: this.idCounter++,
      ...createMovieDto,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    };

    this.movies.push(movie);

    return movie;
  }

  updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = this.movies.find((m) => m.id === id);
    if (!movie) {
      // throw new Error('존재하지 않는 id입니다.');
      throw new NotFoundException('존재하지 않는 id입니다.');
    }

    Object.assign(movie, updateMovieDto);

    return movie;
  }

  deleteMovie(id: number) {
    const movieIndex = this.movies.findIndex((m) => m.id === +id);
    if (movieIndex === -1) {
      throw new NotFoundException('존재하지 않는 id입니다.');
    }

    this.movies.splice(movieIndex, 1);
    return movieIndex;
  }
}
