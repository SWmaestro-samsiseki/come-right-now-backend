import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { findStoreDTO } from 'src/reservation-events/eventDTO/findStore.dto';
import { storeIdDTO } from 'src/reservation-events/eventDTO/storeId.dto';
import { User } from 'src/user/user.entity';
import { StoreService } from 'src/store/store.service';
import { UserService } from 'src/user/user.service';
import { AccountService } from 'src/account/account.service';
import { userOnlineMap } from './onlineMaps/user.onlineMap';
import { storeOnlineMap } from './onlineMaps/store.onlineMap';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ReservationEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly storeService: StoreService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const id = socket.data.uuid;
    const userType = socket.data.userType;
    if (userType === 'USER') {
      if (id in userOnlineMap) {
        delete userOnlineMap[id];
      }
    } else if (userType === 'STORE') {
      if (id in storeOnlineMap) {
        delete storeOnlineMap[id];
      }
    }
    console.log('***disconnected***');
    console.log(userOnlineMap);
  }
  handleConnection(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.headers.auth as string;
    const payload = this.accountService.getPayload(token);
    const id = payload.uuid;
    if (payload.userType === 'USER') {
      userOnlineMap[id] = socket.id;
    } else if (payload.userType === 'STORE') {
      storeOnlineMap[id] = socket.id;
    }

    socket.data.uuid = id;
    socket.data.userType = payload.userType;
    console.log('***connected***');
    console.log(userOnlineMap);
  }

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
