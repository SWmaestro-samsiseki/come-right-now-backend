import { Test, TestingModule } from '@nestjs/testing';
import { BusinessOffController } from './business-off.controller';

describe('BusinessOffController', () => {
  let controller: BusinessOffController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessOffController],
    }).compile();

    controller = module.get<BusinessOffController>(BusinessOffController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
