import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '영화 제목',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '영화 제목 상세',
    example: '제목 상세',
  })
  detail: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '감독 id',
    example: 1,
  })
  directorId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  @ApiProperty({
    description: '장르 ids',
    example: [1],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  genreIds: number[];

  @IsString()
  @ApiProperty({
    description:
      '영화 파일 이름. 확장자 제거한 uuid이름 입력(확장자 입력해도 @TransForm에서 제외한다.)',
  })
  @Transform(({ value }) => value.split('.')[0])
  movieFileName: string;
}
