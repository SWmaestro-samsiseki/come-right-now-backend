import {
  WebSocketGateway,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ReservationService } from 'src/reservation/reservation.service';
import { ReservationStatus } from 'src/enum/reservation-status.enum';
import { WebsocketLogger } from 'src/logger/logger.service';
import { Inject } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class StoreEventsGateway {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly websocketLogger: WebsocketLogger,
    @Inject('STORE_ONLINEMAP') public storeOnlineMap: Record<string, string>,
    @Inject('USER_ONLINEMAP') public userOnlineMap: Record<string, string>,
  ) {
    this.websocketLogger.setContext('reservation-events');
  }

  private emitSocketEvent(socket: Socket, targetSocketId: string, eventName: string, data: any) {
    socket.to(targetSocketId).emit(eventName, data);
    this.websocketLogger.websocketEventLog(eventName, true, true);
  }

  @SubscribeMessage('store.accept-seat.server')
  async acceptSeatEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { reservationId: number; userId: string },
  ) {
    this.websocketLogger.websocketEventLog('store.accept-seat.server', false, true);
    try {
      const { userId, reservationId } = data;
      const reservation = await this.reservationService.getReservationById(reservationId);

      const { reservationStatus } = reservation;
      if (reservationStatus !== ReservationStatus.REQUESTED) {
        return {
          isSuccess: false,
          message: '이미 처리된 요청입니다.',
        };
      }

      await this.reservationService.updateReservationStatus(reservationId, 'PENDING');

      const userSocketId = this.userOnlineMap[userId];
      this.emitSocketEvent(socket, userSocketId, 'server.available-seat.user', reservationId);
      return {
        isSuccess: true,
      };
    } catch (e) {
      this.websocketLogger.websocketEventLog('store.accept-seat.server', true, false);
      this.websocketLogger.error(e);
      return {
        isSuccess: false,
        message: '만료된 요청입니다.',
      };
    }
  }

  @SubscribeMessage('store.check-in.server')
  async checkInEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { reservationId: number; userId: string },
  ): Promise<boolean> {
    this.websocketLogger.websocketEventLog('store.check-in.server', false, true);
    const { reservationId, userId } = data;

    try {
      await this.reservationService.updateArrivalForCheckIn(reservationId);

      const userSocketId = this.userOnlineMap[userId];
      this.emitSocketEvent(socket, userSocketId, 'server.check-in.user', reservationId);
    } catch (e) {
      this.websocketLogger.websocketEventLog('server.check-in.user', true, false);
      this.websocketLogger.error(e);
      return false;
    }

    return true;
  }

  @SubscribeMessage('store.cancel-reservation.server')
  async cancelReservationStore(
    @ConnectedSocket() socket: Socket,
    @MessageBody() reservationId: number,
  ) {
    this.websocketLogger.websocketEventLog('store.cancel-reservation.server', false, true);
    const reservation = await this.reservationService.getReservationById(reservationId);
    const userId = reservation.user.id;
    if (!(userId in this.userOnlineMap)) {
      return {
        reservationId,
        isSuccess: true,
      };
    }
    const userSocketId = this.userOnlineMap[userId];

    try {
      this.emitSocketEvent(socket, userSocketId, 'server.cancel-reservation.user', reservationId);
    } catch (e) {
      this.websocketLogger.websocketEventLog('server.cancel-reservation.user', true, false);
      this.websocketLogger.error(e);

      return {
        isSuccess: false,
      };
    }
    return {
      reservationId,
      isSuccess: true,
    };
  }
}
