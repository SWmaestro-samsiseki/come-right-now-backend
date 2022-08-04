import { Body, Controller, Patch, Post } from '@nestjs/common';
import { StoreService } from 'src/store/store.service';
import { UserService } from 'src/user/user.service';
import { ReservationEventsGateway } from './reservation-events.gateway';
import { findStoreDTO } from './dto/find-store.dto';
import { requestSeatDTO } from './dto/requestSeat.dto';
import { storeOnlineMap } from './onlineMaps/store.onlineMap';
import { ResponseSeatDTO } from './dto/response-seat.dto';
import { ReservationService } from 'src/reservation/reservation.service';
import { userOnlineMap } from './onlineMaps/user.onlineMap';

@Controller('reservation-events')
export class ReservationEventsController {
  constructor(
    private readonly storeService: StoreService,
    private readonly userService: UserService,
    private readonly reservationService: ReservationService,
    private readonly reservationEventsGateway: ReservationEventsGateway,
  ) {}

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
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      creditRate: user.creditRate,
    };
    socketServer.to(storeSocketId).emit('requestSeat', requestSeatDTO);

    return {
      isSuccess: true,
    };
  }

  @Patch('accept-response')
  acceptSeatResponse(@Body() responseSeatDTO: ResponseSeatDTO) {
    const socketServer = this.reservationEventsGateway.server;
    const { userId, reservationId, requestTime } = responseSeatDTO;
    const now = new Date();
    const availableTime = new Date(requestTime);
    availableTime.setMinutes(availableTime.getMinutes() + 10); //FIXME: 타임아웃 시간 config로 관리
    if (availableTime >= now) {
      this.reservationService.updateReservationStatusToPending(reservationId);
      const userSocketId = userOnlineMap[userId];
      socketServer.to(userSocketId).emit('server.available-seat.user', { userId, reservationId });
      return { statusCode: 200 };
    } else {
      return { stausCode: 202, message: '이미 만료된 요청입니다!' };
    }
  }
}
