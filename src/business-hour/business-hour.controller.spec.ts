import { Test, TestingModule } from '@nestjs/testing';
import { BusinessHourController } from './business-hour.controller';

describe('BusinessHourController', () => {
  let controller: BusinessHourController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessHourController],
    }).compile();

    controller = module.get<BusinessHourController>(BusinessHourController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
