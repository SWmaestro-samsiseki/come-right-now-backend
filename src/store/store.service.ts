import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';

@Injectable()
export class StoreService {
  constructor(@InjectRepository(Store) private storeRepository: Repository<Store>) {}

  // 각도를 라디안으로 변환
  degreeToRadian(degree: number): number {
    return degree * (Math.PI / 180);
  }

  //두 지점 사이의 거리 계산 (직선거리)
  //meter 단위로 반환
  getDistance(
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number,
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.degreeToRadian(latitude2 - latitude1);
    const dLon = this.degreeToRadian(longitude2 - longitude1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreeToRadian(latitude1)) *
        Math.cos(this.degreeToRadian(latitude2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const tmp = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const kmDistance = R * tmp;
    return kmDistance * 1000;
  }

  //유요한 거리에 원하는 카테고리를 포함하는 store 배열 반환
  async findCandidateStores(
    longitude: number,
    latitude: number,
    categories: string[],
    distance: number,
  ): Promise<Store[]> {
    const totalStores = [];
    for (let i = 0; i < categories.length; i++) {
      const stores = await this.storeRepository.find({
        relations: ['categories'],
        where: {
          categories: {
            name: categories[i],
          },
        },
      });
      totalStores.push(...stores);
    } //원하는 카테고리를 가진 stores

    const filteredStores = totalStores.filter((store) => {
      const d = this.getDistance(latitude, longitude, store.latitude, store.longitude);
      if (d <= distance) {
        return true;
      }
      return false;
    }); // 원하는 카테고리를 가지면서 거리도 일정 기준 이내의 stores
    return filteredStores;
  }
}
