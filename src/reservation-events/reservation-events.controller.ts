import { Body, Controller, Post } from '@nestjs/common';
import { StoreService } from 'src/store/store.service';
import { UserService } from 'src/user/user.service';
import { ReservationEventsGateway } from './reservation-events.gateway';
import { findStoreDTO } from './dto/find-store.dto';
import { requestSeatDTO } from './dto/requestSeat.dto';
import { storeOnlineMap } from './onlineMaps/store.onlineMap';

@Controller('reservation-events')
export class ReservationEventsController {
  constructor(
    private readonly storeService: StoreService,
    private readonly userService: UserService,
    private readonly reservationEventsGateway: ReservationEventsGateway,
  ) {}

  @Post('seat-request')
  async findStore(@Body() findStoreDTO: findStoreDTO) {
    const distance = 500;
    const { longitude, latitude, categories, numberOfPeople, arrivedAt, userID } = findStoreDTO;
    const socketServer = this.reservationEventsGateway.server;

    // 1. 주점 검색
    const stores = await this.storeService.findCandidateStores(
      longitude,
      latitude,
      categories,
      distance,
    );

    // 2. 주점으로 이벤트 전송
    const user = await this.userService.findUser(userID);
    for (const store of stores) {
      const storeSocketId = storeOnlineMap[store.id];
      const requestSeatDTO: requestSeatDTO = {
        numberOfPeople,
        arrivedAt,
        userID: user.id,
        userName: user.name,
        userPhone: user.phone,
        creditRate: user.creditRate,
      };
      socketServer.to(storeSocketId).emit('requestSeat', requestSeatDTO);
    }

    return {
      isSuccess: true,
    };
  }

  @Post('test/seat-request')
  async testFindStore() {
    const socketServer = this.reservationEventsGateway.server;
    const user = await this.userService.findUser('u1');
    const storeSocketId = storeOnlineMap['u2'];
    const requestSeatDTO: requestSeatDTO = {
      numberOfPeople: 10,
      arrivedAt: new Date(),
      userID: user.id,
      userName: user.name,
      userPhone: user.phone,
      creditRate: user.creditRate,
    };
    socketServer.to(storeSocketId).emit('requestSeat', requestSeatDTO);

    return {
      isSuccess: true,
    };
  }
}
