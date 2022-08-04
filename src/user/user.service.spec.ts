import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

class MockRepository {
  async findOne(option) {
    const {
      where: { id },
    } = option;

    const user = new User();
    user.id = 'testId';

    if (id === user.id) {
      return user;
    }

    return undefined;
  }
}

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: MockRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('findUser', () => {
    it('return user when there is user with the id', async () => {
      const userId = 'testId';

      const user = await userService.findUser(userId);

      expect(user.id).toBe(userId);
    });

    it('throw 404 error when there is no user with the id', async () => {
      const userId = 'wrongTestId';

      try {
        await userService.findUser(userId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
