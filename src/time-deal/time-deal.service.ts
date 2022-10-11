import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DateUtilService } from 'src/date-util/date-util.service';
import { ParticipantStatus } from 'src/enum/participant-status';
import { TimeDealStatus } from 'src/enum/time-deal-status';
import { StoreService } from 'src/store/store.service';
import { LessThan, EntityManager } from 'typeorm';
import { UserTimeDealsDTO } from './dto/user-time-deals.dto';
import { TimeDeal } from './time-deal.entity';

@Injectable()
export class TimeDealService {
  constructor(
    @InjectRepository(TimeDeal) private readonly timeDealRepository,
    private readonly storeService: StoreService,
    private readonly dateUtilService: DateUtilService,
    @InjectEntityManager() private timeDealManager: EntityManager,
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

  // 성능 측정
  async getUserTimeDeals(latitude: number, longitude: number): Promise<TimeDeal[]> {
    const stores = await this.storeService.getStoreWithTimeDeal();
    const nearStores = this.storeService.filterNearStores(latitude, longitude, 0, 500, stores);
    const whereOptions = [];
    for (const nearStore of nearStores) {
      whereOptions.push({
        store: {
          id: nearStore.id,
        },
        status: TimeDealStatus.IN_PROGRESS,
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

  async checkTimeDealValidation() {
    const nowDate = this.dateUtilService.getNowDate();
    const expiredTimeDeals = await this.timeDealRepository.find({
      where: {
        endTime: LessThan(nowDate),
      },
    });

    if (expiredTimeDeals.length !== 0) {
      for (const expiredTimeDeal of expiredTimeDeals) {
        expiredTimeDeal.status = TimeDealStatus.CLOSED;
        await expiredTimeDeal.save();
      }
    }
  }

  async closeTimeDeal(timeDealId: number) {
    const closedStatus = TimeDealStatus.CLOSED;
    const result = await this.timeDealRepository.update(
      { id: timeDealId },
      { status: closedStatus },
    );

    if (result.affected === 0) {
      throw new NotFoundException();
    }

    return timeDealId;
  }

  // TODO: select 값 수정
  async getTimeDealsByUserId(
    userId: string,
    longitude: number,
    latitude: number,
  ): Promise<UserTimeDealsDTO> {
    const timeDeals: UserTimeDealsDTO = await this.timeDealManager.query(
      `
      SELECT t.id,
             t.benefit,
             t.endTime,
             s.id AS storeId,
             s.businessName,
             s.storeImage,
             s.latitude,
             s.longitude,
             Round(St_distance_sphere(Point(?, ?),
                        Point(s.longitude, s.latitude))) AS distance,
             p.id AS participantId
      FROM  time_deal t
            LEFT JOIN store s
                    ON t.storeId = s.id
            LEFT JOIN participant p
                    ON t.id = p.timedealid
      WHERE p.userId = ?
            AND p.status = ?
      `,
      [longitude, latitude, userId, ParticipantStatus.REQUESTED],
    );

    return timeDeals;
  }
}
