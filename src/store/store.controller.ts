import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/account/account.entity';
import { Category } from 'src/category/category.entity';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(Account) private acountRepository: Repository<Account>,
    private readonly storeService: StoreService,
  ) {}

  @Get(':id')
  async getStoreById(@Param('id') id: string) {
    const store = await this.storeService.getStoreById(id);

    if (!store) {
      throw new NotFoundException();
    }

    const {
      masterName,
      masterPhone,
      storeName,
      storeType,
      latitude,
      longitude,
      introduce,
      starRate,
      address,
      storePhone,
      businessNumber,
    } = store;

    const storeWithBusinessHour = {
      masterName,
      masterPhone,
      storeName,
      storeType,
      latitude,
      longitude,
      introduce,
      starRate,
      address,
      storePhone,
      businessNumber,
      openAt: store.businessHours[0].openAt,
      closeAt: store.businessHours[0].closeAt,
      storeImage: store.storeImage ? store.storeImage : '',
      mainMenu1: store.mainMenu1 ? store.mainMenu1 : '',
      mainMenu2: store.mainMenu2 ? store.mainMenu2 : '',
      mainMenu3: store.mainMenu3 ? store.mainMenu3 : '',
    };

    return storeWithBusinessHour;
  }

  /////////// 테스트 데이터 생성기 : localhost:3000/store/ 들어가면 생성
  @Get()
  async makeData() {
    const c1 = this.categoryRepository.create();
    c1.name = 'test1';
    await this.categoryRepository.save(c1);
    const c2 = this.categoryRepository.create();
    c2.name = 'test2';
    await this.categoryRepository.save(c2);
    for (let i = 1; i < 101; i++) {
      const dummyAccount = this.acountRepository.create();
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
      dummyAccount.email = 'test';
      dummyAccount.password = 'test';
      const account = await this.acountRepository.save(dummyAccount);

      dummy.id = account.id;
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
