import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserDto } from './dto/response/user.dto';
import {
  ApiUserDelete,
  ApiUserFindAll,
  ApiUserFindOne,
  ApiUserUpdate,
} from '../document/decorator/user-api.decorator';
import { UserId } from './decorator/user-id.decorator';

@Controller('user')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // auth.service.ts registerUser 에서 회원가입 진행
  // @Post()
  // create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
  //   return this.userService.create(createUserDto);
  // }

  @Get()
  @ApiUserFindAll()
  findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiUserFindOne()
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiUserUpdate()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiUserDelete()
  remove(@UserId('id', ParseIntPipe) id: number): Promise<{ id: number }> {
    return this.userService.remove(id);
  }
}
