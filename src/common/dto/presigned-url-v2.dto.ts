import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class PresignedUrlV2Dto {
  @ApiProperty({
    description: 'UUID 형식의 파일명 (확장자 포함)',
    example: '536d75f1-754b-4888-8575-9d733d8c6886.mp4',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp4|jpg|jpeg)$/,
    {
      message: '올바른 UUID 형식의 파일명이 아닙니다. (확장자: mp4, jpg, jpeg)',
    },
  )
  filename: string;

  @ApiProperty({
    description: '파일의 Content-Type',
    example: 'video/mp4',
    enum: ['video/mp4', 'image/jpg', 'image/jpeg'],
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(video\/mp4|image\/jpg|image\/jpeg)$/, {
    message: '지원하는 Content-Type은 video/mp4, image/jpg, image/jpeg입니다.',
  })
  contentType: string;
}
