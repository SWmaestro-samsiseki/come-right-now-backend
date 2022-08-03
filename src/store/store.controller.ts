import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/account/account.entity';
import { Category } from 'src/category/category.entity';
import { storeOnlineMap } from 'src/reservation-events/onlineMaps/store.onlineMap';
import { ReservationEventsGateway } from 'src/reservation-events/reservation-events.gateway';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { findStoreDTO } from './dto/find-store.dto';
import { requestSeatDTO } from './dto/requestSeat.dto';
import { Store } from './store.entity';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(Account) private acountRepository: Repository<Account>,
    private readonly storeService: StoreService,
    private readonly userService: UserService,
    private readonly reservationEventsGateway: ReservationEventsGateway,
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

  @Post('seat-request')
  async findStore(@Body() findStoreDTO: findStoreDTO) {
    const distance = 500;
    const { longitude, latitude, categories, numberOfPeople, arrivedAt, userId } = findStoreDTO;
    const socketServer = this.reservationEventsGateway.server;

    // 1. 주점 검색
    const stores = await this.storeService.findCandidateStores(
      longitude,
      latitude,
      categories,
      distance,
    );

    // 2. 주점으로 이벤트 전송
    const user = await this.userService.findUser(userId);
    for (const store of stores) {
      const storeSocketId = storeOnlineMap[store.id];
      const requestSeatDTO: requestSeatDTO = {
        numberOfPeople,
        arrivedAt,
        userId: user.id,
        username: user.name,
        userPhone: user.phone,
        creditRate: user.creditRate,
      };
      socketServer.to(storeSocketId).emit('requestSeat', requestSeatDTO);
    }

    return {
      isSuccess: true,
    };
  }

  @Get(':id')
  async getStoreById(@Param('id') id: string) {
    const store = await this.storeService.getStoreById(id);

    if (!store) {
      throw new NotFoundException();
    }

    const { storeName, storeType, starRate, address, storePhone, mainMenu1, mainMenu2, mainMenu3 } =
      store;

    //TODO: openAt, closeAt 추가
    return {
      storeName,
      storeType,
      starRate,
      address,
      storePhone,
      mainMenu1,
      mainMenu2,
      mainMenu3,
    };
  }

  @Post('test/seat-request')
  async testFindStore(@Body() findStoreDTO: findStoreDTO) {
    const { numberOfPeople, arrivedAt, userId } = findStoreDTO;
    const socketServer = this.reservationEventsGateway.server;

    const user = await this.userService.findUser(userId);
    const storeSocketId = storeOnlineMap['u2'];
    const requestSeatDTO: requestSeatDTO = {
      numberOfPeople,
      arrivedAt,
      userId: user.id,
      username: user.name,
      userPhone: user.phone,
      creditRate: user.creditRate,
    };
    socketServer.to(storeSocketId).emit('requestSeat', requestSeatDTO);

    return {
      isSuccess: true,
    };
  }
}
