import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLocalFilePathDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'multer upload 파일 이름(uuid)' })
  filename: string;
}
