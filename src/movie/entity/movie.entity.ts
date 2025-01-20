import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from './base-table.entity';
import { MovieDetail } from './movie-detail.entity';

/// manyToOne Director -> 감독은 여러개의 영화를 만들 수 있음
/// oneToMany MovieDetail ->영화는 하나의 상세 내용을 가질 수 있음
/// manyToMany Genre -> 장르는 여러개의 영화에 속할 수 있음. 영화는 여러개의 장르에 속할 수 있음

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => MovieDetail)
  @JoinColumn()
  detail: MovieDetail;
}
