import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

type findOneOption = {
  where: {
    id: string;
  };
};

class MockRepository {
  async findOne(option: findOneOption) {
    const {
      where: { id },
    } = option;

    const user = new User();
    user.id = id;

    return user;
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
  });
});
