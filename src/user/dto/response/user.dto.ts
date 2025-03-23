import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../entity/user.entity';
import { ApiResponse } from '../../../common/response/response.dto';

export class UserDto {
  @ApiProperty({ description: '사용자 아이디' }) id: number;

  @ApiProperty({ description: '사용자 이메일' }) email: string;

  @ApiProperty({
    description: '사용자 권한. 0:일반, 1:구독, 2:관리자',
    enum: Role,
  })
  role: Role;
}

export type UserResponseDto = ApiResponse<UserDto>;
export type UserListResponseDto = ApiResponse<UserDto[]>;
