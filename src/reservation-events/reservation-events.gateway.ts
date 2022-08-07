import {
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AccountService } from 'src/account/account.service';
import { userOnlineMap } from './onlineMaps/user.onlineMap';
import { storeOnlineMap } from './onlineMaps/store.onlineMap';
import { userFindStoreServerDTO } from './dto/user-find-store-server.dto';
import { StoreService } from 'src/store/store.service';
import { returnFindStoreServerDTO } from './dto/return-find-store-server.dto';
import { DateUtilService } from 'src/date-util/date-util.service';
import { serverFindStoreStoreDTO } from './dto/server-find-store-store.dto';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ReservationEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly accountService: AccountService,
    private readonly storeService: StoreService,
    private readonly dateUtilService: DateUtilService,
    private readonly userService: UserService,
  ) {}

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { uuid: id, userType } = socket.data;
    if (userType === 'USER') {
      if (id in userOnlineMap) {
        delete userOnlineMap[id];
      }
    } else if (userType === 'STORE') {
      if (id in storeOnlineMap) {
        delete storeOnlineMap[id];
      }
    }
    //TODO: 로그로 전환
    console.log('***disconnected***');
    console.log('<User Online>');
    console.log(userOnlineMap);
    console.log('Store Online>');
    console.log(storeOnlineMap);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.headers.auth as string;
    const payload = this.accountService.getPayload(token);
    const { uuid, userType } = payload;
    if (userType === 'USER') {
      userOnlineMap[uuid] = socket.id;
    } else if (userType === 'STORE') {
      storeOnlineMap[uuid] = socket.id;
    }
    socket.data = {
      uuid,
      userType,
    };
    //TODO: 로그로 전환
    console.log('***connected***');
    console.log('<User Online>');
    console.log(userOnlineMap);
    console.log('<Store Online>');
    console.log(storeOnlineMap);
  }

  @SubscribeMessage('user.find-store.server')
  async userFindStoreToServer(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userFindStoreServerDTO: userFindStoreServerDTO,
  ) {
    const distance = 500;
    const {
      categories,
      numberOfPeople,
      delayMinutes,
      userId,
      longitude,
      latitude,
    }: userFindStoreServerDTO = userFindStoreServerDTO;

    // 1. 주점 검색
    const stores = await this.storeService.findCandidateStores(
      longitude,
      latitude,
      categories,
      distance,
    );

    if (stores.length === 0) {
      const result: returnFindStoreServerDTO = {
        isSuccess: false,
      };
      return result;
    }
    // 2. 주점으로 이벤트 전송
    const result: returnFindStoreServerDTO = {
      isSuccess: true,
      datas: [],
    };
    const user = await this.userService.getUserInfo(userId);
    for (const store of stores) {
      try {
        const storeSocketId = storeOnlineMap[store.id];
        const estimatedTime = this.dateUtilService.getEstimatedTime(
          latitude,
          longitude,
          store.latitude,
          store.longitude,
          delayMinutes,
        );
        result.datas.push({
          estimatedTime,
          numberOfPeople,
          storeId: store.id,
        });
        const serverFindStoreStoreDTO: serverFindStoreStoreDTO = {
          userName: user.name,
          userPhone: user.phone,
          creditRate: user.creditRate,
          numberOfPeople,
          userId,
          estimatedTime,
        };
        socket.to(storeSocketId).emit('server.find-store.store', serverFindStoreStoreDTO);
      } catch (e) {
        result.isSuccess = false;
        result.datas = e;
        return result;
      }
    }

    return result;
  }
}
