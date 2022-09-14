import { Test, TestingModule } from '@nestjs/testing';
import { TimeDealService } from './time-deal.service';

describe('TimeDealService', () => {
  let service: TimeDealService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeDealService],
    }).compile();

    service = module.get<TimeDealService>(TimeDealService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
