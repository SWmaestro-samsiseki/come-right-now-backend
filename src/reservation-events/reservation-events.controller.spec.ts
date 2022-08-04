import { Test, TestingModule } from '@nestjs/testing';
import { ReservationEventsController } from './reservation-events.controller';

describe('ReservationEventsController', () => {
  let controller: ReservationEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationEventsController],
    }).compile();

    controller = module.get<ReservationEventsController>(ReservationEventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
