import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from '../../director/entity/director.entity';
import { Genre } from '../../genre/entities/genre.entity';
import { Transform } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { MovieUserLike } from './movie-user-like.entity';

/// manyToOne Director -> 감독은 여러개의 영화를 만들 수 있음
/// oneToMany MovieDetail ->영화는 하나의 상세 내용을 가질 수 있음
/// manyToMany Genre -> 장르는 여러개의 영화에 속할 수 있음. 영화는 여러개의 장르에 속할 수 있음

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.createdMovies)
  creator: User;

  @Column({
    unique: true,
  })
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];

  @Column({
    default: 0,
  })
  likeCount: number;

  @Column({
    default: 0,
  })
  dislikeCount: number;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true, // 관계테이블 자동 생성
    nullable: false,
  })
  @JoinColumn()
  movieDetail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.id, {
    cascade: true,
    nullable: false,
  })
  director: Director;

  @Column()
  @Transform(({ value }) =>
    process.env.ENV === 'prod'
      ? `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${value}`
      : `http://localhost:3000/${value}`,
  )
  movieFileName: string;

  @OneToMany(() => MovieUserLike, (mul) => mul.movie)
  likedUsers: MovieUserLike[];
}
