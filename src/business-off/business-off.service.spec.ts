import { Test, TestingModule } from '@nestjs/testing';
import { BusinessOffService } from './business-off.service';

describe('BusinessOffService', () => {
  let service: BusinessOffService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessOffService],
    }).compile();

    service = module.get<BusinessOffService>(BusinessOffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
