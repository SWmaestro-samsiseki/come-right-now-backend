import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateUtilService } from 'src/date-util/date-util.service';
import { StoreService } from 'src/store/store.service';
import { Repository } from 'typeorm';
import { TimeDeal, TimeDealStatus } from './time-deal.entity';

@Injectable()
export class TimeDealService {
  constructor(
    @InjectRepository(TimeDeal) private readonly timeDealRepository: Repository<TimeDeal>,
    private readonly storeService: StoreService,
    private readonly dateUtilService: DateUtilService,
  ) {}

  async getStoreTimeDeal(storeId: string): Promise<TimeDeal> {
    const timeDeal = await this.timeDealRepository
      .createQueryBuilder('timeDeal')
      .leftJoinAndSelect('timeDeal.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoin('timeDeal.store', 'store')
      .where('timeDeal.store.id = :id AND timeDeal.status = :status', {
        id: storeId,
        status: TimeDealStatus.IN_PROGRESS,
      })
      .getOne();

    if (!timeDeal) {
      throw new NotFoundException('no timeDeal');
    }

    return timeDeal;
  }

  async getUserTimeDeals(latitude: number, longitude: number) {
    const stores = await this.storeService.getStoreWithTimeDeal();
    const nearStores = this.storeService.findNearStores(latitude, longitude, 0, 500, stores);
    const whereOptions = [];
    for (const nearStore of nearStores) {
      whereOptions.push({
        store: {
          id: nearStore.id,
        },
      });
    }

    const timeDeals = await this.timeDealRepository.find({
      relations: ['store'],
      where: whereOptions,
    });

    if (timeDeals.length === 0) {
      throw new NotFoundException('no time deal in condition');
    }
    return timeDeals;
  }

  async createTimeDeal(duration: number, benefits: string, storeId: string) {
    const timeDeal = this.timeDealRepository.create();
    const nowDate = this.dateUtilService.getNowDate();
    const endTime = this.dateUtilService.addMinute([duration], nowDate);
    const store = await this.storeService.getStoreById(storeId);

    timeDeal.endTime = endTime;
    timeDeal.benefit = benefits;
    timeDeal.status = TimeDealStatus.IN_PROGRESS;
    timeDeal.store = store;

    const { id } = await this.timeDealRepository.save(timeDeal);
    const result = await this.timeDealRepository.findOne({
      where: {
        id,
      },
    });
    return result;
  }
}
