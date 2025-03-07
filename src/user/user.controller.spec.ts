import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return correct value', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@test.ai',
        password: 'test123',
      };

      const user = {
        id: 1,
        ...createUserDto,
      };

      jest.spyOn(service, 'create').mockResolvedValue(user as User);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const users = [
        {
          id: 1,
          email: 'test@test.ai',
        },
        {
          id: 2,
          email: 'test@test2.ai',
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(users as User[]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = {
        id: 1,
        email: 'test@test.ai',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(user as User);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });
});
