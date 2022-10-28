import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { anything, instance, mock, reset, when } from 'ts-mockito';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;

  const userRepository: Repository<User> = mock<Repository<User>>();

  beforeEach(async () => {
    const instanceUserRepository = instance(userRepository);
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useFactory: () => new UserService(instanceUserRepository),
        },
      ],
    }).compile();

    userService = app.get(UserService);
  });

  afterEach(async () => {
    reset(userRepository);
  });

  describe('findUser', () => {
    it('return user if user is exists', async () => {
      const userId: string = faker.datatype.uuid();
      const user = new User();
      user.id = userId;

      when(userRepository.findOne(anything())).thenResolve(user);

      const result = await userService.findUser(userId);

      expect(result.id).toBe(userId);
    });

    it('throw Not Found Exception if there is no user with the id', async () => {
      const userId: string = faker.datatype.uuid();

      when(userRepository.findOne(anything())).thenReject(new NotFoundException());

      try {
        await userService.findUser(userId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('createUser', () => {
    it('create and return if there is no user with the id', async () => {
      const createUserDTO: CreateUserDTO = {
        id: faker.datatype.uuid(),
        name: 'test',
        phone: '010-1223-4567',
        birthDate: '000222',
      };
      const user = new User();
      user.id = createUserDTO.id;
      user.name = createUserDTO.name;
      user.phone = createUserDTO.phone;
      user.birthDate = createUserDTO.birthDate;
      user.creditRate = 5;

      when(userRepository.find(anything())).thenResolve(undefined);
      when(userRepository.save(anything())).thenResolve(user);

      const result = await userService.createUser(createUserDTO);

      expect(result.id).toBe(createUserDTO.id);
      expect(result.creditRate).toBe(5);
    });
  });
});
