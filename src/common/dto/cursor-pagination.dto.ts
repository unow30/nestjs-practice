import { IsArray, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  // 정렬을 할 값을 콤마로 받는다.
  // id_52, likeCount_20
  cursor?: string;

  @IsArray()
  @IsString({
    each: true, //전부 문자열
  })
  @IsOptional()
  // id_ASC or id_DESC
  // [id_DESC, likeCount_DESC]
  order: string[] = ['id_DESC'];

  @IsInt()
  @IsOptional()
  take: number = 5;
}
