import { Test, TestingModule } from '@nestjs/testing';
import { StoreTableService } from './store-table.service';

describe('StoreTableService', () => {
  let service: StoreTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreTableService],
    }).compile();

    service = module.get<StoreTableService>(StoreTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
