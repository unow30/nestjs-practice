import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '페이지네이션 커서',
  })
  // 정렬을 할 값을 콤마로 받는다.
  // id_52, likeCount_20
  cursor?: string;

  @IsArray()
  @IsString({
    each: true, //전부 문자열
  })
  @IsOptional()
  @ApiProperty({
    description: `내림차순, 오름차순 정렬. 다수의 칼럼 중복 정렬 가능.`,
    example: ['id_DESC'],
  })
  // swagger 입력값이 한개면 문자열로 인식한다. transform 으로 입력값을 리스트화
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  // id_ASC or id_DESC
  // [id_DESC, likeCount_DESC]
  order: string[] = ['id_DESC'];

  @IsInt()
  @IsOptional()
  @ApiProperty({
    description: '가져올 데이터 갯수',
    example: 5,
  })
  take: number = 5;
}
