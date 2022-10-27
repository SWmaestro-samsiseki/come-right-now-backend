import { faker } from '@faker-js/faker';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateUtilService } from 'src/date-util/date-util.service';
import { TimeDealStatus } from 'src/enum/time-deal-status';
import { Store } from 'src/store/store.entity';
import { StoreService } from 'src/store/store.service';
import { anyOfClass, anything, instance, mock, objectContaining, reset, when } from 'ts-mockito';
import { EntityManager, Repository, UpdateResult } from 'typeorm';
import { TimeDeal } from './time-deal.entity';
import { TimeDealService } from './time-deal.service';

describe('TimeDealService', () => {
  let timeDealService: TimeDealService;

  const timeDealRepository: Repository<TimeDeal> = mock<Repository<TimeDeal>>();
  const storeService: StoreService = mock<StoreService>();
  const dateUtilService: DateUtilService = mock<DateUtilService>();
  const timeDealManager: EntityManager = mock<EntityManager>();

  beforeEach(async () => {
    const iTimeDealRepository = instance(timeDealRepository);
    const iStoreService = instance(storeService);
    const iDateUtilService = instance(dateUtilService);
    const iTimeDealManager = instance(timeDealManager);

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TimeDealService,
          useFactory: () =>
            new TimeDealService(
              iTimeDealRepository,
              iStoreService,
              iDateUtilService,
              iTimeDealManager,
            ),
        },
      ],
    }).compile();

    timeDealService = app.get(TimeDealService);
  });

  afterEach(async () => {
    reset(timeDealRepository);
    reset(storeService);
    reset(dateUtilService);
    reset(timeDealManager);
  });

  describe('findAndCheckTimeDeal', () => {
    it('return time deal if there is time deal with the id', async () => {
      const timeDealId = 0;
      const timeDeal = new TimeDeal();
      timeDeal.id = timeDealId;
      timeDeal.status = TimeDealStatus.IN_PROGRESS;

      when(timeDealRepository.findOne(anything())).thenResolve(timeDeal);

      const result = await timeDealService.findAndCheckTimeDeal(timeDealId);

      expect(result.id).toBe(timeDealId);
    });

    it('throw Not Found Exception if there is no time deal with id', async () => {
      const timeDealId = 0;
      const timeDeal = new TimeDeal();
      timeDeal.id = timeDealId;
      timeDeal.status = TimeDealStatus.IN_PROGRESS;

      when(timeDealRepository.findOne(anything())).thenResolve(undefined);

      try {
        await timeDealService.findAndCheckTimeDeal(timeDealId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('throw Bad Request Exception if time deal was closed', async () => {
      const timeDealId = 0;
      const timeDeal = new TimeDeal();
      timeDeal.id = timeDealId;
      timeDeal.status = TimeDealStatus.CLOSED;

      when(timeDealRepository.findOne(anything())).thenResolve(timeDeal);

      try {
        await timeDealService.findAndCheckTimeDeal(timeDealId);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe('closeTimeDeal', () => {
    it('return timeDealId if there is time deal in progress', async () => {
      const timeDealId = 0;
      const updateResult: UpdateResult = mock(UpdateResult);
      updateResult.affected = 1;
      when(timeDealRepository.update(anything(), anything())).thenResolve(updateResult);

      const result = await timeDealService.closeTimeDeal(timeDealId);

      expect(result).toBe(timeDealId);
    });

    it('throw Not Found Exception if there is no time deal with the id', async () => {
      const timeDealId = 0;
      const updateResult: UpdateResult = mock(UpdateResult);
      updateResult.affected = 0;
      when(timeDealRepository.update(anything(), anything())).thenResolve(updateResult);

      try {
        await timeDealService.closeTimeDeal(timeDealId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
