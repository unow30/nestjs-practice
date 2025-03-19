import { BaseTable } from '../../common/entity/base-table.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from '../../movie/entity/movie.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Genre extends BaseTable {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '장르 id' })
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: '장르 이름' })
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.genres, {
    cascade: true,
    nullable: false,
  })
  @ApiProperty({ type: () => [Movie], description: '영화 목록' })
  movies: Movie[];
}
