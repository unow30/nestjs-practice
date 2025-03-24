import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';

export class GenreDto {
  @ApiProperty({ description: '장르 id' })
  @IsNumber()
  @Expose()
  id: number;

  @ApiProperty({ description: '장르 이름' })
  @Column({ unique: true })
  @Expose()
  name: string;
}
