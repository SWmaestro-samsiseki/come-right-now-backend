import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { StoreService } from 'src/store/store.service';
import { UserService } from 'src/user/user.service';
import { ReservationEventsGateway } from './reservation-events.gateway';
import { findStoreDTO } from './dto/find-store.dto';
import { storeOnlineMap } from './onlineMaps/store.onlineMap';
import { ReservationService } from 'src/reservation/reservation.service';

@Controller('reservation-events')
export class ReservationEventsController {
  constructor(
    private readonly storeService: StoreService,
    private readonly userService: UserService,
    private readonly reservationEventsGateway: ReservationEventsGateway,
    private readonly reservationService: ReservationService,
  ) {}

  @Post('seat-request')
  async findStore(@Body() findStoreDTO: findStoreDTO) {
    const distance = 500;
    const { longitude, latitude, categories, numberOfPeople, willArrivedAt, userId } = findStoreDTO;
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
      try {
        const storeSocketId = storeOnlineMap[store.id];
        const reservation = await this.reservationService.createReservation(
          numberOfPeople,
          willArrivedAt,
          user.id,
          store.id,
        );
        socketServer.to(storeSocketId).emit('server.request-seat.store', {
          reservationId: reservation.id,
        });
      } catch (e) {
        throw new BadRequestException();
      }
    }

    return {
      isSuccess: true,
    };
  }

  /////////////test api for frontend

  @Post('test/seat-request')
  async testFindStore() {
    const socketServer = this.reservationEventsGateway.server;
    const user = await this.userService.findUser('u1');
    const storeSocketId = storeOnlineMap['u2'];
    const requestSeatDTO = {
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

  @Post('test/seat-reservation')
  async testReserved() {
    const date = new Date();
    const dateString = date.toLocaleTimeString();
    const time = dateString.slice(0, dateString.indexOf(':', 7));
    const socketServer = this.reservationEventsGateway.server;
    const data = {
      userName: '최지윤',
      phone: '010-1234-1234',
      creditRate: 70,
      peopleNumber: 6,
      estimatedTime: time,
    };
    const storeSocketId = storeOnlineMap['u2'];
    socketServer.to(storeSocketId).emit('server.make-reservation.store', data);
  }
}
