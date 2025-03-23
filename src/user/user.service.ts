import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { envVariableKeys } from '../common/const/env.const';
import { ConfigService } from '@nestjs/config';
import { UserDto } from './dto/response/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const { email, password } = createUserDto;
    const user = await this.userRepository.findOne({ where: { email: email } });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일입니다.');
    }

    const hash = await bcrypt.hash(
      password,
      this.configService.get<number>(envVariableKeys.hashRounds),
    );

    await this.userRepository.save({ email, password: hash });

    return this.userRepository.findOne({ where: { email: email } });
  }

  async findAll(): Promise<UserDto[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { id: id } });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const { password } = updateUserDto;

    const user = await this.userRepository.findOne({ where: { id: id } });

    if (!user) throw new NotFoundException('User not found');

    const hash = await bcrypt.hash(
      password,
      this.configService.get<number>(envVariableKeys.hashRounds),
    );
    await this.userRepository.update(id, { ...updateUserDto, password: hash });

    return await this.userRepository.findOne({ where: { id: id } });
  }

  async remove(id: number): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.delete(id);
    return id;
  }
}
