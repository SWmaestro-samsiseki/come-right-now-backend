import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/account/account.entity';
import { getAccount } from 'src/account/get-account.decorator';
import { Category } from 'src/category/category.entity';
import { Repository } from 'typeorm';
import { StoreInfoDTO } from './dto/store-info.dto';
import { StoreMyInfoDTO } from './dto/store-my-info.dto';
import { Store } from './store.entity';
import { StoreService } from './store.service';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(Account) private acountRepository: Repository<Account>,
    private readonly storeService: StoreService,
  ) {}

  @Get(':id/info')
  async getStoreById(@Param('id') id: string): Promise<StoreInfoDTO> {
    const store = await this.storeService.getStoreById(id);

    return store;
  }

  @Get('my-info')
  @UseGuards(AuthGuard())
  async getStoreMyInfo(@getAccount() account): Promise<StoreMyInfoDTO> {
    const { id, email } = account;
    const storeInfo = await this.storeService.getStoreMyInfo(id, email);

    return storeInfo;
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
