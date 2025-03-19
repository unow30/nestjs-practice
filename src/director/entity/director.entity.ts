import { BaseTable } from '../../common/entity/base-table.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from '../../movie/entity/movie.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Director extends BaseTable {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '감독 id' })
  id: number;

  @Column()
  @ApiProperty({ description: '감독 이름' })
  name: string;

  @Column()
  @ApiProperty({ description: '감독 생일' })
  dob: Date;

  @Column()
  @ApiProperty({ description: '감독 국가' })
  nationality: string;

  @OneToMany(() => Movie, (movie) => movie.director)
  @ApiProperty({ type: () => [Movie], description: '감독 영화 목록' })
  movies: Movie[];
}
