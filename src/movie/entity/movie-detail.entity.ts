import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class MovieDetail {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '영화 상세 id' })
  id: number;

  @Column()
  @ApiProperty({ description: '영화 상세내용' })
  detail: string;

  @OneToOne(() => Movie, (movie) => movie.id)
  @ApiProperty({ type: () => Movie, description: '영화' })
  movie: Movie;
}
