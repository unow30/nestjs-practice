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
import { Genre } from '../../genre/entity/genre.entity';
import { Transform } from 'class-transformer';
import { User } from '../../user/entity/user.entity';
import { MovieUserLike } from './movie-user-like.entity';
import { ApiProperty } from '@nestjs/swagger';

/// manyToOne Director -> 감독은 여러개의 영화를 만들 수 있음
/// oneToMany MovieDetail ->영화는 하나의 상세 내용을 가질 수 있음
/// manyToMany Genre -> 장르는 여러개의 영화에 속할 수 있음. 영화는 여러개의 장르에 속할 수 있음

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '영화 아이디' })
  id: number;

  @ManyToOne(() => User, (user) => user.createdMovies)
  @ApiProperty({
    type: () => User,
    description: '영화 생성(업로드)자. 관리자 권한만 영화를 생성(업로드)한다.',
  })
  creator: User;

  @Column({
    unique: true,
  })
  @ApiProperty({ description: '영화 제목, 고유제목' })
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  @ApiProperty({
    type: () => [Genre],
    description: '영화 장르',
  })
  genres: Genre[];

  @Column({
    default: 0,
  })
  @ApiProperty({ description: '좋아요 개수(미적용)' })
  likeCount: number;

  @Column({
    default: 0,
  })
  @ApiProperty({ description: '싫어요 개수(미적용)' })
  dislikeCount: number;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true, // 관계테이블 자동 생성
    nullable: false,
  })
  @JoinColumn()
  @ApiProperty({ type: () => MovieDetail, description: '영화 상세내용' })
  movieDetail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.id, {
    cascade: true,
    nullable: false,
  })
  @ApiProperty({ type: () => Director, description: '영화 감독' })
  director: Director;

  @Column()
  @Transform(({ value }) => {
    // 이미 CloudFront URL 형식이면 그대로 반환
    if (
      value &&
      typeof value === 'string' &&
      value.includes('cloudfront.net')
    ) {
      return value;
    }
    // return `https://d16ufd393m7gss.cloudfront.net/public/movie/${value}/origin.m3u8`;
    return `https://ceramic-tager.store/public/movie/${value}/origin.m3u8`;
  })
  @ApiProperty({ description: '영화 파일명:uuid' })
  movieFileName: string;

  @OneToMany(() => MovieUserLike, (mul) => mul.movie)
  @ApiProperty({
    type: () => [MovieUserLike],
    description: '영화 좋아요 사용자 목록',
  })
  likedUsers: MovieUserLike[];
}
