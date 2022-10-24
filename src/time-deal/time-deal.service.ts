import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DateUtilService } from 'src/date-util/date-util.service';
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

  async findAndCheckTimeDeal(timeDealId: number): Promise<TimeDeal> {
    const timeDeal = await this.timeDealRepository.findOne({
      where: {
        id: timeDealId,
      },
    });

    if (!timeDeal) {
      throw new NotFoundException('no time deal');
    }

    if (timeDeal.status === TimeDealStatus.CLOSED) {
      throw new BadRequestException('time deal is closed');
    }

    return timeDeal;
  }

  async getStoreTimeDeals(storeId: string): Promise<TimeDeal[]> {
    const openTimeDealquery = await this.timeDealRepository
      .createQueryBuilder('timeDeal')
      .leftJoinAndSelect('timeDeal.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoin('timeDeal.store', 'store');

    openTimeDealquery.where('timeDeal.store.id = :id AND timeDeal.status = :status', {
      id: storeId,
      status: TimeDealStatus.IN_PROGRESS,
    });

    const openTimeDeals = await openTimeDealquery.getMany();

    const closeTimeDealquery = await this.timeDealRepository
      .createQueryBuilder('timeDeal')
      .innerJoinAndSelect('timeDeal.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoin('timeDeal.store', 'store');

    closeTimeDealquery.where('timeDeal.store.id = :id AND timeDeal.status = :status', {
      id: storeId,
      status: TimeDealStatus.CLOSED,
    });

    const closeTimeDeals = await closeTimeDealquery.getMany();

    const timeDeals = [...openTimeDeals, ...closeTimeDeals];

    if (timeDeals.length === 0) {
      throw new NotFoundException('no timeDeal');
    }

    return timeDeals;
  }

  // 성능 측정
  async getUserTimeDeals(latitude: number, longitude: number): Promise<TimeDeal[]> {
    const query = this.timeDealRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.store', 's')
      .where(
        `St_distance_sphere(Point(:lng, :lat), Point(s.longitude, s.latitude)) >= :start 
    AND St_distance_sphere(Point(:lng, :lat), Point(s.longitude, s.latitude)) <= :end `,
        {
          lat: latitude,
          lng: longitude,
          start: 0,
          end: 500,
        },
      )
      .andWhere('t.status=:status', {
        status: TimeDealStatus.IN_PROGRESS,
      });

    const timeDeals = await query.getMany();

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
  ): Promise<UserTimeDealsDTO[]> {
    const timeDeals: UserTimeDealsDTO[] = await this.timeDealManager.query(
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
             p.id AS participantId,
             p.status
      FROM  time_deal t
            LEFT JOIN store s
                    ON t.storeId = s.id
            LEFT JOIN participant p
                    ON t.id = p.timedealid
      WHERE p.userId = ?
      `,
      [longitude, latitude, userId],
    );

    return timeDeals;
  }
}
