import { Test, TestingModule } from '@nestjs/testing';
import { TimeDealController } from './time-deal.controller';

describe('TimeDealController', () => {
  let controller: TimeDealController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeDealController],
    }).compile();

    controller = module.get<TimeDealController>(TimeDealController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
