import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GenreDto } from '../../../genre/dto/response/genre-response.dto';
import { DirectorDto } from '../../../director/dto/response/director-response.dto';
import { MovieDetailDto } from './movie-detail.response.dto';

export class MovieResponseDto {
  @ApiProperty({ description: '영화 ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '영화 제목' })
  @IsString()
  title: string;

  @ApiProperty({ description: '영화 파일 경로' })
  @IsString()
  movieFileName: string;

  @ApiProperty({ description: '좋아요 수' })
  @IsNumber()
  likeCount: number;

  @ApiProperty({ description: '싫어요 수' })
  @IsNumber()
  dislikeCount: number;

  @ApiPropertyOptional({
    description:
      '사용자의 좋아요 상태 (null: 평가 안함, true: 좋아요, false: 싫어요)',
    type: Boolean,
    nullable: true,
  })
  @IsOptional()
  likeStatus?: boolean | null;

  @ApiPropertyOptional({
    description: '영화 감독 정보',
    type: DirectorDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DirectorDto)
  director?: DirectorDto;

  @ApiPropertyOptional({
    description: '영화 장르 목록',
    type: [GenreDto],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenreDto)
  genres?: GenreDto[];

  @ApiPropertyOptional({
    type: () => MovieDetailDto,
    description: '영화 상세내용',
    nullable: true,
  })
  @IsOptional()
  movieDetail?: MovieDetailDto;
}

export class MovieListResponseDto {
  @ApiProperty({ description: '영화 목록', type: [MovieResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovieResponseDto)
  data: MovieResponseDto[];

  @ApiProperty({
    description: '다음 페이지 커서',
    type: String,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  nextCursor: string | null;

  @ApiProperty({ description: '전체 영화 수' })
  @IsNumber()
  count: number;
}
