import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockType } from 'test/test.type';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  }));
  let userService: UserService;
  let userRepository: MockType<Repository<User>>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    userService = module.get(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('findUser', () => {
    it('return user', async () => {
      const user = { id: '1', name: 'test' };
      userRepository.findOne.mockReturnValue(user);

      expect(await userService.findUser('1')).toEqual(user);
    });

    it('throw NotFoundException', async () => {
      const user = undefined;
      userRepository.findOne.mockReturnValue(user);

      try {
        await userService.findUser('1');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('getUserInfo', () => {
    it('return UserInfoDTO', async () => {
      userRepository.createQueryBuilder.mockReturnValue({
        innerJoinAndMapOne: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue({
          id: '1',
          name: 'test',
          phone: '1',
          birthDate: '1',
          creditRate: 1,
          account: {
            email: '1',
          },
        }),
      });

      const result = await userService.getUserInfo('1');
      expect(result.id).toBe('1');
      expect(result.name).toBe('test');
      expect(result.phone).toBe('1');
      expect(result.birthDate).toBe('1');
      expect(result.creditRate).toBe(1);
      expect(result.email).toBe('1');
    });

    it('if no user with id, throw NotFoundException', async () => {
      userRepository.createQueryBuilder.mockReturnValue({
        innerJoinAndMapOne: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(undefined),
      });

      try {
        await userService.getUserInfo('1');
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
