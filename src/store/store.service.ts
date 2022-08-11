import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateUtilService } from 'src/date-util/date-util.service';
import { Repository } from 'typeorm';
import { StoreForPublicDTO } from './dto/store-for-public.dto';
import { Store } from './store.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    private readonly dateUtilService: DateUtilService,
  ) {}

  // 각도를 라디안으로 변환
  private degreeToRadian(degree: number): number {
    return degree * (Math.PI / 180);
  }

  //두 지점 사이의 거리 계산 (직선거리)
  //meter 단위로 반환
  private getDistance(
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number,
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.degreeToRadian(latitude2 - latitude1);
    const dLon = this.degreeToRadian(longitude2 - longitude1);
    const temp1 =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreeToRadian(latitude1)) *
        Math.cos(this.degreeToRadian(latitude2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const temp2 = 2 * Math.atan2(Math.sqrt(temp1), Math.sqrt(1 - temp1));
    const kmDistance = R * temp2;
    return kmDistance * 1000;
  }

  //유요한 거리에 원하는 카테고리를 포함하는 store 배열 반환
  async findCandidateStores(
    longitude: number,
    latitude: number,
    categories: number[],
    distance: number,
  ): Promise<Store[]> {
    const whereOptions = [];
    for (const category of categories) {
      whereOptions.push({
        categories: {
          id: category,
        },
      });
    }
    const totalStores = await this.storeRepository.find({
      relations: ['categories'],
      where: whereOptions,
    });
    //원하는 카테고리를 가진 stores
    const filteredStores = totalStores.filter((store) => {
      const d = this.getDistance(latitude, longitude, store.latitude, store.longitude);
      if (d <= distance) {
        return true;
      }
      return false;
    }); // 원하는 카테고리를 가지면서 거리도 일정 기준 이내의 stores

    if (filteredStores.length === 0) {
      throw new NotFoundException('no store in condition');
    }
    return filteredStores;
  }

  // storeId에 해당하는 주점 검색 및 store 객체 반환
  async findStore(storeId: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      relations: ['businessHours'],
      where: {
        id: storeId,
      },
    });

    if (!store) {
      throw new NotFoundException('no store');
    }

    return store;
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
    const todayBusinessHours = businessHours.filter(
      (bh) => bh.businessDay === this.dateUtilService.getDayOfWeekToday(),
    )[0];

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
}
