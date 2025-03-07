import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUserRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: 1, email: 'test@test.ai' }];
      jest.spyOn(mockUserRepository, 'find').mockResolvedValue(users);
      // mockUserRepository.find.mockResolvedValue(users); spyOn과 같다.

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: 1, email: 'test@test.ai' };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);
      // mockUserRepository.findOne.mockResolvedValue(user); spyOn과 같다.

      const result = await service.findOne(1);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    });

    it('should throw a NotFoundException if user is not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(99999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 99999 },
      });
    });
  });

  describe('remove', () => {
    it('should delete a user by id', async () => {
      const id = 999;
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue({
        id: 1,
      });

      const result = await service.remove(id);

      expect(result).toEqual(id);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should throw a NotFoundException if user is not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      expect(service.remove(99999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 99999 },
      });
    });
  });

  describe('create', () => {
    it('should create a new user and return it', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@codefactory.ai',
        password: '123123',
      };
      const hashRounds = 10;
      const hashedPassword = 'hashashhashhcivhasdf';
      const result = {
        id: 1,
        email: createUserDto.email,
        password: hashedPassword,
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(mockConfigService, 'get').mockReturnValue(hashRounds);
      jest.spyOn(bcrypt, 'hash').mockImplementation((password, hashRound) => hashedPassword);
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce(result);

      const createdUser = await service.create(createUserDto);

      expect(createdUser).toEqual(result);
      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(1, { where: { email: createUserDto.email } });
      expect(mockUserRepository.findOne).toHaveBeenNthCalledWith(2, { where: { email: createUserDto.email } });
      expect(mockConfigService.get).toHaveBeenCalledWith(expect.anything());
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, hashRounds);
      expect(mockUserRepository.save).toHaveBeenCalledWith({ email: createUserDto.email, password: hashedPassword });
    });

    it('should throw a BadRequestException if email already exist', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@test.ai',
        password: '123123',
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce({
        id: 1,
        email: createUserDto.email,
      });

      expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
    });
  });

  describe('update', () => {
    it('should update a user if it exists and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'test@codefactory.ai',
        password: '123123',
      };
      const hashRounds = 10;
      const hashedPassword = 'hashashndvizxcjnvkolisadf';
      const user = {
        id: 1,
        email: updateUserDto.email,
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(mockConfigService, 'get').mockReturnValue(hashRounds);
      jest.spyOn(bcrypt, 'hash').mockImplementation((pass, hashRounds) => hashedPassword);
      jest.spyOn(mockUserRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce({ ...user, password: hashedPassword });

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual({ ...user, password: hashedPassword });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserDto.password, hashRounds);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, { email: 'test@codefactory.ai', password: 'hashashndvizxcjnvkolisadf' });
    });

    it('should throw a NotFoundException if user to update is not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      const updateUserDto: UpdateUserDto = {
        email: 'test@codefactory.ai',
        password: '123123',
      };

      expect(service.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});
