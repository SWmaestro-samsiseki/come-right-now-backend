import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';

@Injectable()
export class StoreService {
  constructor(@InjectRepository(Store) private storeRepository: Repository<Store>) {}

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

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
    }

    const filteredStores = totalStores.filter((store) => {
      const d = this.getDistance(latitude, longitude, store.latitude, store.longitude) * 1000; // meter
      if (d <= distance) {
        return true;
      }
      return false;
    });
    return filteredStores;
  }
}
