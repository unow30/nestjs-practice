import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Movie } from '../../movie/entity/movie.entity';

export class BaseTable {
  @CreateDateColumn()
  @Exclude()
  @ApiProperty({ description: '생성일자' })
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  @ApiProperty({ description: '변경일자' })
  updatedAt: Date;

  @Exclude()
  @VersionColumn()
  @ApiProperty({ description: '변경횟수(생성시 1)' })
  version: number;
}
