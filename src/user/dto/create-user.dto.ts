import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({
    description: '이메일 주소',
  })
  email: string;
  @ApiProperty({
    description: '비밀번호',
  })
  password: string;
}
