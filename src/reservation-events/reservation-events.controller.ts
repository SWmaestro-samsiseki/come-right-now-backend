import { Controller, Post } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { ReservationEventsGateway } from './reservation-events.gateway';
import { storeOnlineMap } from './onlineMaps/store.onlineMap';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('reservation-events')
@Controller('reservation-events')
export class ReservationEventsController {
  constructor(
    private readonly userService: UserService,
    private readonly reservationEventsGateway: ReservationEventsGateway,
  ) {}

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
      numberOfPeople: 6,
      estimatedTime: time,
    };
    const storeSocketId = storeOnlineMap['u2'];
    socketServer.to(storeSocketId).emit('server.make-reservation.store', data);
  }
}
