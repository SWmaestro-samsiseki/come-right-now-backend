import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/category/category.entity';
import { Repository } from 'typeorm';
import { Store } from './store.entity';

@Controller('store')
export class StoreController {
  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
  ) {}

  // 테스트 데이터 생성기 : localhost:3000/store/ 들어가면 생성
  @Get()
  async makeData() {
    const c1 = this.categoryRepository.create();
    c1.name = 'test1';
    await this.categoryRepository.save(c1);
    const c2 = this.categoryRepository.create();
    c2.name = 'test2';
    await this.categoryRepository.save(c2);
    for (let i = 1; i < 101; i++) {
      const dummy = this.storeRepository.create();
      let lat = 0;
      let lng = 0;
      if (i % 2 == 0) {
        lat = 37.56368 + Math.random() / 100;
        lng = 126.976433 + Math.random() / 100;
        dummy.categories = [c1];
      } else {
        lat = 37.56368 - Math.random() / 100;
        lng = 126.976433 - Math.random() / 100;
        dummy.categories = [c2];
      }
      dummy.email = 'test';
      dummy.password = 'test';
      dummy.masterName = 'test';
      dummy.storeName = 'test';
      dummy.businessName = 'test';
      dummy.storeType = 'test';
      dummy.address = 'test';
      dummy.latitude = lat;
      dummy.longitude = lng;
      dummy.masterPhone = 'test';
      dummy.businessNumber = 'test';
      await this.storeRepository.save(dummy);
    }
  }
}
