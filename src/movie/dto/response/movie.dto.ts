import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GenreDto } from '../../../genre/dto/response/genre.dto';
import { DirectorDto } from '../../../director/dto/response/director.dto';
import { MovieDetailDto } from './movie-detail.response.dto';

export class MovieDto {
  @ApiProperty({ description: '영화 ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '영화 제목' })
  @IsString()
  title: string;

  @ApiProperty({ description: '영화 파일 경로, s3 bucket' })
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

export class MovieListItemDto extends OmitType(MovieDto, [
  'movieDetail',
] as const) {}

export class MovieListRecentDto extends PickType(MovieDto, [
  'id',
  'title',
  'likeCount',
  'dislikeCount',
  'movieFileName',
]) {}

export class MovieListResponseDto {
  @ApiProperty({ description: '영화 목록', type: [MovieListItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovieListItemDto)
  data: MovieListItemDto[];

  @ApiProperty({
    description: '다음 페이지 커서',
    type: 'string',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  nextCursor: string | null;

  @ApiProperty({ description: '전체 영화 수' })
  @IsNumber()
  count: number;
}
