import { UseInterceptors } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WebsocketLogger } from 'src/logger/logger.service';
import { NewrelicWebsocketInterceptor } from 'src/newrelic/newrelic.websocket.interceptor';
import { ParticipantService } from 'src/participant/participant.service';
import { storeOnlineMap } from 'src/reservation-events/onlineMaps/store.onlineMap';
import { TimeDealService } from './time-deal.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
@UseInterceptors(NewrelicWebsocketInterceptor)
export class TimeDealEventsGateway {
  constructor(
    private readonly timeDealService: TimeDealService,
    private readonly participantService: ParticipantService,
    private readonly websocketLogger: WebsocketLogger,
  ) {
    this.websocketLogger.setContext('reservation-events');
  }

  private emitSocketEvent(socket: Socket, targetSocketId: string, eventName: string, data: any) {
    socket.to(targetSocketId).emit(eventName, data);
    this.websocketLogger.websocketEventLog(eventName, true, true);
  }

  @SubscribeMessage('user.check-in-time-deal.server')
  async checkInTimeDealEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { participantId: number; storeId: string },
  ) {
    this.websocketLogger.websocketEventLog('user.check-in-time-deal.server', false, true);

    try {
      const { participantId, storeId } = data;

      await this.participantService.updateStatusForCheckInTimeDeal(participantId);

      const storeSocketId = storeOnlineMap[storeId];
      this.emitSocketEvent(socket, storeSocketId, 'server.check-in-time-deal.store', participantId);
    } catch (e) {
      this.websocketLogger.websocketEventLog('server.check-in-time-deal.store', true, false);
      this.websocketLogger.error(e);

      return false;
    }

    return true;
  }
}
