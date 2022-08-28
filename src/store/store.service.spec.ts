import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DateUtilService } from 'src/date-util/date-util.service';
import { MockType } from 'test/test.type';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { StoreService } from './store.service';

describe('storeService', () => {
  let storeService: StoreService;
  let dateUtilService: MockType<DateUtilService>;
  let httpService: MockType<HttpService>;
  let storeRepository: MockType<Repository<Store>>;

  const mockDateUtilServiceFactory: () => MockType<DateUtilService> = jest.fn(() => ({
    getDayOfWeekToday: jest.fn(),
  }));
  const mockHttpServiceFactory: () => MockType<HttpService> = jest.fn(() => ({
    post: jest.fn(),
  }));
  const mockRepositoryFactory: () => MockType<Repository<Store>> = jest.fn(() => ({
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        StoreService,
        {
          provide: DateUtilService,
          useFactory: mockDateUtilServiceFactory,
        },
        {
          provide: HttpService,
          useFactory: mockHttpServiceFactory,
        },
        {
          provide: getRepositoryToken(Store),
          useFactory: mockRepositoryFactory,
        },
      ],
    }).compile();

    storeService = module.get<StoreService>(StoreService);
    dateUtilService = module.get(DateUtilService);
    httpService = module.get(HttpService);
    storeRepository = module.get(getRepositoryToken(Store));
  });

  describe('findCandidateStores', () => {
    it('return filtered stores', async () => {
      const longitude = 1;
      const latitude = 1;
      const categories = [1];
      const distnace = 1;
      storeRepository.find.mockReturnValue([
        {
          latitude: 1,
          longitude: 1,
        },
      ]);

      const result = await storeService.findCandidateStores(
        longitude,
        latitude,
        categories,
        distnace,
      );

      expect(result[0].latitude).toBe(1);
      expect(result[0].longitude).toBe(1);
    });

    it('throw NotFoundException if no store in condition', async () => {
      const longitude = 100;
      const latitude = 100;
      const categories = [1];
      const distnace = 1;
      storeRepository.find.mockReturnValue([
        {
          latitude: 1,
          longitude: 1,
        },
      ]);

      try {
        await storeService.findCandidateStores(longitude, latitude, categories, distnace);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    describe('getStoreByIdForPublic', () => {
      it('return storeForPublicDTO', async () => {
        const storeId = '1';
        storeRepository.findOne.mockReturnValue({
          id: storeId,
          businessHours: [
            {
              businessDay: 'test',
              openAt: '1',
              closeAt: '1',
            },
          ],
        });
        dateUtilService.getDayOfWeekToday.mockReturnValue('test');

        const result = await storeService.getStoreByIdForPublic(storeId);

        expect(result.todayOpenAt).toBe('1');
        expect(result.todayCloseAt).toBe('1');
        expect(result.id).toBe('1');
      });

      it('throw NotFoundException if there is no store with the id', async () => {
        const storeId = '1';
        storeRepository.findOne.mockReturnValue(undefined);
        dateUtilService.getDayOfWeekToday.mockReturnValue('test');

        try {
          await storeService.getStoreByIdForPublic(storeId);
        } catch (e) {
          expect(e).toBeInstanceOf(NotFoundException);
        }
      });
    });
  });
});
