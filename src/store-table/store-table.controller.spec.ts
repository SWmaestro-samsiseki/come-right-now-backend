import { Test, TestingModule } from '@nestjs/testing';
import { StoreTableController } from './store-table.controller';

describe('StoreTableController', () => {
  let controller: StoreTableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreTableController],
    }).compile();

    controller = module.get<StoreTableController>(StoreTableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
