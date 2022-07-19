import { Test, TestingModule } from '@nestjs/testing';
import { BusinessHourService } from './business-hour.service';

describe('BusinessHourService', () => {
  let service: BusinessHourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessHourService],
    }).compile();

    service = module.get<BusinessHourService>(BusinessHourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
