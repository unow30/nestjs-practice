import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Movie } from './movie.entity';
import { User } from '../../user/entity/user.entity';
import { IsBoolean } from 'class-validator';

@Entity()
export class MovieUserLike extends BaseTable {
  //영화 좋아요
  @PrimaryColumn({
    name: 'movieId',
    type: 'int8',
  })
  @ManyToOne(() => Movie, (movie) => movie.likedUsers, {
    onDelete: 'CASCADE', // 영화가 지워진 경우 같이 지워진다.
  })
  movie: Movie;

  //좋아요 유저
  @PrimaryColumn({
    name: 'userId',
    type: 'int8',
  })
  @ManyToOne(() => User, (user) => user.likedMovies, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  @IsBoolean()
  isLike: boolean;
}
