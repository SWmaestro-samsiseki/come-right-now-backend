import {
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
  @WebSocketServer() public server: Server;
  constructor(private readonly accountService: AccountService) {}
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
    console.log('Store Online>');
    console.log(storeOnlineMap);
  }
}
