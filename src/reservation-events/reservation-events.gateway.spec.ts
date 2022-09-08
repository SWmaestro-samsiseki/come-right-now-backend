import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { AccountService } from 'src/account/account.service';
import { DateUtilService } from 'src/date-util/date-util.service';
import { WebsocketLogger } from 'src/logger/logger.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { StoreService } from 'src/store/store.service';
import { MockType } from 'test/test.type';
import { userFindStoreServerDTO } from './dto/user-find-store-server.dto';
import { ReservationEventsGateway } from './reservation-events.gateway';

describe('reservationEventsGateway', () => {
  //   const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  //     findOne: jest.fn(),
  //     createQueryBuilder: jest.fn(),
  //   }));
  //   let userService: UserService;
  //   let userRepository: MockType<Repository<User>>;

  //   beforeEach(async () => {
  //     const module: TestingModule = await Test.createTestingModule({
  //       imports: [],
  //       controllers: [],
  //       providers: [
  //         UserService,
  //         {
  //           provide: getRepositoryToken(User),
  //           useFactory: repositoryMockFactory,
  //         },
  //       ],
  //     }).compile();

  //     userService = module.get(UserService);
  //     userRepository = module.get(getRepositoryToken(User));
  //   });
  let websocketLogger: MockType<WebsocketLogger>;
  let storeService: MockType<StoreService>;
  let dateUtilService: MockType<DateUtilService>;
  let reservationService: MockType<ReservationService>;
  let reservationEventsGateway: ReservationEventsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        ReservationEventsGateway,
        {
          provide: WebsocketLogger,
          useValue: {
            websocketEventLog: jest.fn(),
            error: jest.fn(),
            setContext: jest.fn(),
          },
        },
        {
          provide: StoreService,
          useValue: {
            findCandidateStores: jest.fn(),
          },
        },
        {
          provide: DateUtilService,
          useValue: {
            getEstimatedTime: jest.fn(),
          },
        },
        {
          provide: ReservationService,
          useValue: {
            createReservation: jest.fn(),
          },
        },
        {
          provide: 'STORE_ONLINEMAP',
          useValue: {
            test1: 'test1',
          },
        },
        {
          provide: 'USER_ONLINEMAP',
          useValue: {
            test1: 'test1',
          },
        },
        {
          provide: AccountService,
          useValue: {},
        },
      ],
    }).compile();

    websocketLogger = module.get(WebsocketLogger);
    storeService = module.get(StoreService);
    dateUtilService = module.get(DateUtilService);
    reservationService = module.get(ReservationService);
    reservationEventsGateway = module.get(ReservationEventsGateway);
  });

  //   describe('findUser', () => {
  //     it('return user', async () => {
  //       const user = { id: '1', name: 'test' };
  //       userRepository.findOne.mockReturnValue(user);

  //       expect(await userService.findUser('1')).toEqual(user);
  //     });

  //     it('throw NotFoundException', async () => {
  //       const user = undefined;
  //       userRepository.findOne.mockReturnValue(user);

  //       try {
  //         await userService.findUser('1');
  //       } catch (e) {
  //         expect(e).toBeInstanceOf(NotFoundException);
  //       }
  //     });
  //   });

  describe('userFindStoreToServer', () => {
    it('return true when there are stores in conditon and online', async () => {
      jest.mock('socket.io');
      const socket = new Socket(null, null, null);
      const messageBody: userFindStoreServerDTO = {
        categories: [1, 2],
        numberOfPeople: 1,
        delayMinutes: 1,
        longitude: 1,
        latitude: 1,
        userId: '1',
      };
      storeService.findCandidateStores.mockReturnValue([
        {
          id: 'test1',
        },
      ]);
      dateUtilService.getEstimatedTime.mockReturnValue(new Date());
      reservationService.createReservation.mockReturnValue(1);

      const result = await reservationEventsGateway.userFindStoreToServer(socket, messageBody);

      expect(result).toBe(true);
    });
  });

  //   describe('userFindStoreToServerFurther', () => {});
});
