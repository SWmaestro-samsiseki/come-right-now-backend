import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { findStoreDTO } from 'src/reservation-events/eventDTO/findStore.dto';
import { storeIdDTO } from 'src/reservation-events/eventDTO/storeId.dto';
import { User } from 'src/user/user.entity';
import { StoreService } from 'src/store/store.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ReservationEventsGateway {
  constructor(
    private readonly storeService: StoreService,
    private readonly userService: UserService,
  ) {}

  //#WTD-160
  @SubscribeMessage('findStore')
  async findStore(@ConnectedSocket() socket: Socket, @MessageBody() data: findStoreDTO) {
    const distance = 500;
    // #1. 주점 검색
    const { longitude, latitude, categories } = data;
    const stores = await this.storeService.findCandidateStores(
      longitude,
      latitude,
      categories,
      distance,
    );

    // #2. 주점으로 이벤트 전송
    const { numberOfPeople, arrivedAt, userId } = data;
    const user = await this.userService.findUser(userId);
    for (const store of stores) {
      this.sendToStore(socket, store.id, numberOfPeople, arrivedAt, user);
    }
  }

  /*
  주점으로 자리요청 이벤트 전송
   */
  sendToStore(
    socket: Socket,
    storeId: string,
    numberOfPeople: number,
    arrivedAt: Date,
    user: User,
  ) {
    const storeIdData: storeIdDTO = {
      numberOfPeople,
      arrivedAt,
      userSocketId: socket.id,
      username: user.name,
      userPhone: user.phone,
      creditRate: user.creditRate,
    };

    socket.emit(`${storeId}`, storeIdData);
  }
}
