import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeDeal, TimeDealStatus } from './time-deal.entity';

@Injectable()
export class TimeDealService {
  constructor(
    @InjectRepository(TimeDeal) private readonly timeDealRepository: Repository<TimeDeal>,
    @Inject('TIME_DEAL_STATUS') private readonly timeDealStatus: TimeDealStatus,
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
}
