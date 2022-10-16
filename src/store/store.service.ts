import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateUtilService } from 'src/date-util/date-util.service';
import { TMapService } from 'src/t-map/t-map.service';
import { Brackets, IsNull, Not, Repository } from 'typeorm';
import { StoreForPublicDTO } from './dto/store-for-public.dto';
import { Store } from './store.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    private readonly dateUtilService: DateUtilService,
    private readonly tmapService: TMapService,
  ) {}

  //유요한 거리에 원하는 카테고리를 포함하는 store 배열 반환
  async findStoresNearUser(
    longitude: number,
    latitude: number,
    categories: number[],
    startMeter: number,
    endMeter: number,
  ): Promise<Store[]> {
    const query = this.storeRepository.createQueryBuilder('s').leftJoin('s.categories', 'c');
    query
      .where(
        `St_distance_sphere(Point(:lng, :lat), Point(s.longitude, s.latitude)) >= :start 
      AND St_distance_sphere(Point(:lng, :lat), Point(s.longitude, s.latitude)) <= :end `,
        {
          lat: latitude,
          lng: longitude,
          start: startMeter,
          end: endMeter,
        },
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where(`c.id=:id`, {
            id: categories[0],
          });
          for (let i = 1; i < categories.length; i++) {
            qb.orWhere(`c.id=:id`, {
              id: categories[i],
            });
          }
        }),
      );

    const filteredStores = await query.getMany();
    return filteredStores;
  }

  // 주점이용자가 storeId를 통해 검색한 주점의 정보 반환
  async getStoreByIdForPublic(storeId: string): Promise<StoreForPublicDTO> {
    const store = await this.storeRepository.findOne({
      select: [
        'id',
        'businessName',
        'storeType',
        'address',
        'latitude',
        'longitude',
        'storePhone',
        'introduce',
        'storeImage',
        'mainMenu1',
        'mainMenu2',
        'mainMenu3',
        'menuImage',
        'starRate',
        'businessHours',
      ],
      relations: ['businessHours'],
      where: {
        id: storeId,
      },
    });
    if (!store) {
      throw new NotFoundException('no store');
    }

    const { businessHours } = store;
    const dayOfWeekToday = this.dateUtilService.getDayOfWeekToday();
    const todayBusinessHours = businessHours.filter((bh) => bh.businessDay === dayOfWeekToday)[0];

    const storeForPublicDTO: StoreForPublicDTO = {
      ...store,
      todayOpenAt: todayBusinessHours ? todayBusinessHours.openAt : null,
      todayCloseAt: todayBusinessHours ? todayBusinessHours.closeAt : null,
    };
    return storeForPublicDTO;
  }

  // 주점업자 본인이 조회할 수 있는 주점 정보 반환
  // FIXME: email을 인자로 넘겨 받을 지 account 테이블에서 조회해올 지 결정
  async getStoreById(storeId: string): Promise<Store> {
    const store = await this.storeRepository
      .createQueryBuilder('store')
      .innerJoinAndMapOne('store.account', 'store.id', 'account')
      .select(['store', 'account.email'])
      .where('store.id = :storeId', { storeId })
      .getOne();

    if (!store) {
      throw new NotFoundException('no store');
    }

    return store;
  }

  async getDistanceMeterFromTmap(
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number,
  ) {
    const path = await this.tmapService.getPathFromTmap(
      latitude1,
      longitude1,
      latitude2,
      longitude2,
    );
    const distance = path.totalDistance as number;

    return distance;
  }
}
