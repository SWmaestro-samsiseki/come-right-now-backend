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
}
