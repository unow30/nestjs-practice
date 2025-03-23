import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GenreDto {
  @ApiProperty({ description: '장르 id' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '장르 이름' })
  @Column({ unique: true })
  name: string;
}
