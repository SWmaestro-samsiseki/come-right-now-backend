import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { Store } from 'src/store/store.entity';
import { StoreService } from 'src/store/store.service';
import { UserService } from 'src/user/user.service';
import { findStoreDTO } from './eventDTO/findStore.dto';
import { ReservationEventsGateway } from './reservation-events.gateway';

jest.mock('socket.io');

describe('ReservationEventsGateway', () => {
  let reservationEventsGateway: ReservationEventsGateway;
  let storeService: StoreService;
  let userService: UserService;
  let mockSocket: Socket;

  beforeEach(async () => {
    const MockUserService = {
      provide: UserService,
      useFactory: () => {
        return {
          findUser: jest.fn(() => {
            return {
              test: 'test',
            };
          }),
        };
      },
    };

    const MockStoreService = {
      provide: StoreService,
      useFactory: () => {
        return {
          findCandidateStores: jest.fn(() => {
            const testStore1 = new Store();
            const testStore2 = new Store();

            return [testStore1, testStore2];
          }),
        };
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReservationEventsGateway, MockStoreService, MockUserService],
    }).compile();

    reservationEventsGateway = module.get<ReservationEventsGateway>(ReservationEventsGateway);
    userService = module.get<UserService>(UserService);
    storeService = module.get<StoreService>(StoreService);
    mockSocket = new Socket(null, null, null);
  });

  describe('findStore', () => {
    it('emit storeId event with storeIdData', async () => {
      const testData: findStoreDTO = {
        categories: ['test'],
        numberOfPeople: 1,
        arrivedAt: new Date(),
        userId: 'test',
        longitude: 1,
        latitude: 1,
      };

      await reservationEventsGateway.findStore(mockSocket, testData);

      expect(storeService.findCandidateStores).toBeCalledWith(
        testData.longitude,
        testData.latitude,
        testData.categories,
        500,
      );
      expect(userService.findUser).toBeCalledWith(testData.userId);
      expect(mockSocket.emit).toBeCalledTimes(2);
    });
  });
});
