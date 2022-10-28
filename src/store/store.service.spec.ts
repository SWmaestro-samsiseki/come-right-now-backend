import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BusinessHour } from 'src/business-hour/business-hour.entity';
import { DateUtilService } from 'src/date-util/date-util.service';
import { DayOfWeek } from 'src/enum/days-of-week.enum';
import { TMapService } from 'src/t-map/t-map.service';
import { anything, instance, mock, reset, when } from 'ts-mockito';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { StoreService } from './store.service';

describe('StoreService', () => {
  let storeService: StoreService;

  const storeRepository: Repository<Store> = mock<Repository<Store>>();
  const dateUtilService: DateUtilService = mock<DateUtilService>();
  const tmapService: TMapService = mock<TMapService>();

  beforeEach(async () => {
    const iStoreRepository = instance(storeRepository);
    const iDateUtilService = instance(dateUtilService);
    const iTmapService = instance(tmapService);

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: StoreService,
          useFactory: () => new StoreService(iStoreRepository, iDateUtilService, iTmapService),
        },
      ],
    }).compile();

    storeService = app.get(StoreService);
  });

  afterEach(async () => {
    reset(storeRepository);
    reset(dateUtilService);
    reset(tmapService);
  });

  describe('getStoreByIdForPublic', () => {
    it('return StoreForPublicDto if store is exists with the id', async () => {
      const storeId = faker.datatype.uuid();
      const store = new Store();
      store.id = storeId;
      const businessHour = new BusinessHour();
      businessHour.businessDay = DayOfWeek.MON;
      const openDate = new Date(1);
      const closeDate = new Date(2);
      businessHour.openAt = openDate;
      businessHour.closeAt = closeDate;
      store.businessHours = [businessHour];

      when(storeRepository.findOne(anything())).thenResolve(store);
      when(dateUtilService.getDayOfWeekToday()).thenReturn(DayOfWeek.MON);

      const result = await storeService.getStoreByIdForPublic(storeId);

      expect(result.id).toBe(storeId);
      expect(result.todayOpenAt).toBe(openDate);
      expect(result.todayCloseAt).toBe(closeDate);
    });

    it('throw Not Found Exception if there is no store with the id', async () => {
      const storeId = faker.datatype.uuid();
      const store = new Store();
      store.id = storeId;
      const businessHour = new BusinessHour();
      businessHour.businessDay = DayOfWeek.MON;
      const openDate = new Date(1);
      const closeDate = new Date(2);
      businessHour.openAt = openDate;
      businessHour.closeAt = closeDate;
      store.businessHours = [businessHour];

      when(storeRepository.findOne(anything())).thenResolve(undefined);
      when(dateUtilService.getDayOfWeekToday()).thenReturn(DayOfWeek.MON);

      try {
        await storeService.getStoreByIdForPublic(storeId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
