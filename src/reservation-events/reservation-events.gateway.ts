import {
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AccountService } from 'src/account/account.service';
import { WebsocketLogger } from 'src/logger/logger.service';
import { Inject } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ReservationEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly accountService: AccountService,
    private readonly websocketLogger: WebsocketLogger,
    @Inject('STORE_ONLINEMAP') public storeOnlineMap: Record<string, string>,
    @Inject('USER_ONLINEMAP') public userOnlineMap: Record<string, string>,
  ) {
    this.websocketLogger.setContext('reservation-events');
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { uuid: id, userType } = socket.data;
    if (userType === 'USER') {
      if (id in this.userOnlineMap) {
        delete this.userOnlineMap[id];
      }
    } else if (userType === 'STORE') {
      if (id in this.storeOnlineMap) {
        delete this.storeOnlineMap[id];
      }
    }

    this.websocketLogger.websocketConnectionLog(false, socket.id, userType);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    let token: string;
    if (socket.handshake.headers.auth) {
      token = socket.handshake.headers.auth as string;
    } else if (socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }

    if (!token) {
      const uuid = 'mock' + Math.floor(Math.random() * 100000);
      this.userOnlineMap[uuid] = socket.id;
      socket.data = {
        uuid,
        userType: 'USER',
      };
      this.websocketLogger.websocketConnectionLog(true, socket.id, 'USER');
      return;
    }
    const payload = this.accountService.getPayload(token);
    const { uuid, userType } = payload;
    if (userType === 'USER') {
      this.userOnlineMap[uuid] = socket.id;
    } else if (userType === 'STORE') {
      this.storeOnlineMap[uuid] = socket.id;
    }
    socket.data = {
      uuid,
      userType,
    };

    this.websocketLogger.websocketConnectionLog(true, socket.id, userType);
  }
}
