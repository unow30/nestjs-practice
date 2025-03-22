import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class MovieDetailDto {
  @IsNumber()
  @ApiProperty({ description: '영화 상세 id' })
  id: number;

  @Column()
  @ApiProperty({ description: '영화 상세내용' })
  detail: string;
}
