import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../entity/user.entity';
import { ApiResponse } from '../../../common/response/response.dto';
import { Expose } from 'class-transformer';

export class UserDto {
  @ApiProperty({ description: '사용자 아이디' })
  @Expose()
  id: number;

  @ApiProperty({ description: '사용자 이메일' })
  @Expose()
  email: string;

  @ApiProperty({
    description: '사용자 권한. 0:일반, 1:구독, 2:관리자',
    enum: Role,
  })
  @Expose()
  role: Role;
}

export class UserToken {
  @ApiProperty({
    description: '리프레시 토큰',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsInJvbGUiOjAsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzQyODAyMDcwLCJleHAiOjE3NDI4ODg0NzB9.uHdsJnf0XVEBsPmHdKOjgQL4Mi8HemW3Sk7aqRzg7EA',
  })
  refreshToken: string;

  @ApiProperty({
    description: '액세스 토큰',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsInJvbGUiOjAsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NDI4MDIwNzAsImV4cCI6MTc0Mjg4ODQ3MH0.tgA9bhGA8KwGtO4oLQxvFcWGXqvGPZKlL_4J-l1OKyA',
  })
  accessToken: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'user001@test.ai',
    description: '사용자 이메일',
  })
  email: string;

  @ApiProperty({
    example: '123123',
    description: '사용자 비밀번호',
  })
  password: string;
}

export type UserResponseDto = ApiResponse<UserDto>;
export type UserListResponseDto = ApiResponse<UserDto[]>;
