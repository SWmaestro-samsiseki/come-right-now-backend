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
import { DateUtilService } from 'src/date-util/date-util.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { CreateReservationDTO } from 'src/reservation/dto/create-reservation.dto';
import { ReservationStatus } from 'src/enum/reservation-status.enum';
import { WebsocketLogger } from 'src/logger/logger.service';
import { Store } from 'src/store/store.entity';
import { UseInterceptors } from '@nestjs/common';
import { NewrelicWebsocketInterceptor } from 'src/newrelic.websocket.interceptor';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
@UseInterceptors(new NewrelicWebsocketInterceptor())
export class ReservationEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly accountService: AccountService,
    private readonly storeService: StoreService,
    private readonly dateUtilService: DateUtilService,
    private readonly reservationService: ReservationService,
    private readonly websocketLogger: WebsocketLogger,
  ) {
    this.websocketLogger.setContext('reservation-events');
  }

  private async findStoreWithDistance(
    startMeter: number,
    endMeter: number,
    categories: number[],
    userLongitude: number,
    userLatitude: number,
  ): Promise<Store[]> {
    const stores = await this.storeService.findCandidateStores(
      userLongitude,
      userLatitude,
      categories,
      startMeter,
      endMeter,
    );

    return stores;
  }

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

    this.websocketLogger.websocketConnectionLog(false, socket.id, userType);
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

    this.websocketLogger.websocketConnectionLog(true, socket.id, userType);
  }

  @SubscribeMessage('user.find-store.server')
  async userFindStoreToServer(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userFindStoreServerDTO: userFindStoreServerDTO,
  ) {
    this.websocketLogger.websocketEventLog('user.find-store.server', false, true);
    const userId = socket.data.uuid;
    const {
      categories,
      numberOfPeople,
      delayMinutes,
      longitude,
      latitude,
    }: userFindStoreServerDTO = userFindStoreServerDTO;
    let stores: Store[];
    try {
      stores = await this.findStoreWithDistance(0, 500, categories, longitude, latitude);
    } catch (e) {
      this.websocketLogger.websocketEventLog('server.find-store.store', true, false);
      this.websocketLogger.error(e);
      return false;
    }

    // 2. 주점으로 이벤트 전송
    let onlineStoreFlag = false;
    for (const store of stores) {
      if (!(store.id in storeOnlineMap)) {
        continue;
      }

      if (!onlineStoreFlag) {
        onlineStoreFlag = true;
      }

      try {
        const estimatedTime = await this.dateUtilService.getEstimatedTime(
          latitude,
          longitude,
          store.latitude,
          store.longitude,
          delayMinutes,
        );
        const createReservationDTO: CreateReservationDTO = {
          numberOfPeople,
          estimatedTime,
          userId,
          delayMinutes,
          storeId: store.id,
        };
        const reservationId = await this.reservationService.createReservation(createReservationDTO);

        const storeSocketId = storeOnlineMap[store.id];
        socket.to(storeSocketId).emit('server.find-store.store', reservationId);
        this.websocketLogger.websocketEventLog('server.find-store.store', true, true);
      } catch (e) {
        this.websocketLogger.websocketEventLog('server.find-store.store', true, false);
        this.websocketLogger.error(e);
        return false;
      }
    }

    if (!onlineStoreFlag) {
      this.websocketLogger.websocketEventLog('server.find-store.store', true, false);
      this.websocketLogger.error('no online store in condition');
      return false;
    }

    return true;
  }

  @SubscribeMessage('user.find-store-further.server')
  async userFindStoreToServerFurther(
    @ConnectedSocket() socket: Socket,
    @MessageBody() userFindStoreServerDTO: userFindStoreServerDTO,
  ) {
    this.websocketLogger.websocketEventLog('user.find-store-further.server', false, true);
    const userId = socket.data.uuid;
    const {
      categories,
      numberOfPeople,
      delayMinutes,
      longitude,
      latitude,
    }: userFindStoreServerDTO = userFindStoreServerDTO;

    let stores: Store[];
    try {
      stores = await this.findStoreWithDistance(500, 1000, categories, longitude, latitude);
    } catch (e) {
      this.websocketLogger.websocketEventLog('server.find-store-further.store', true, false);
      this.websocketLogger.error(e);
      return false;
    }

    // 2. 주점으로 이벤트 전송
    let onlineStoreFlag = false;

    for (const store of stores) {
      if (!(store.id in storeOnlineMap)) {
        continue;
      }

      if (!onlineStoreFlag) {
        onlineStoreFlag = true;
      }

      try {
        const estimatedTime = await this.dateUtilService.getEstimatedTime(
          latitude,
          longitude,
          store.latitude,
          store.longitude,
          delayMinutes,
        );
        const createReservationDTO: CreateReservationDTO = {
          numberOfPeople,
          estimatedTime,
          userId,
          delayMinutes,
          storeId: store.id,
        };
        const reservationId = await this.reservationService.createReservation(createReservationDTO);

        const storeSocketId = storeOnlineMap[store.id];
        socket.to(storeSocketId).emit('server.find-store.store', reservationId);
        this.websocketLogger.websocketEventLog('server.find-store.store', true, true);
      } catch (e) {
        this.websocketLogger.websocketEventLog('server.find-store.store', true, false);
        this.websocketLogger.error(e);
        return false;
      }
    }

    if (!onlineStoreFlag) {
      this.websocketLogger.websocketEventLog('server.find-store-further.store', true, false);
      this.websocketLogger.error('no online store in condition');
      return false;
    }

    return true;
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

      const userSocketId = userOnlineMap[userId];
      socket.to(userSocketId).emit('server.available-seat.user', reservationId);
      this.websocketLogger.websocketEventLog('store.accept-seat.server', true, true);
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

  @SubscribeMessage('user.make-reservation.server')
  async makeReservationEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { storeId: string; reservationId: number },
  ): Promise<boolean> {
    this.websocketLogger.websocketEventLog('user.make-reservation.server', false, true);
    const { storeId, reservationId } = data;
    try {
      await this.reservationService.updateReservationStatus(reservationId, 'RESERVED');

      const storeSocketId = storeOnlineMap[storeId];
      socket.to(storeSocketId).emit('server.make-reservation.store', reservationId);
      this.websocketLogger.websocketEventLog('server.make-reservation.store', true, true);

      return true;
    } catch (e) {
      this.websocketLogger.websocketEventLog('server.make-reservation.store', true, false);
      this.websocketLogger.error(e);

      return false;
    }
  }

  @SubscribeMessage('user.delay-reservation.server')
  async delayReservarionEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() reservationId: number,
  ) {
    this.websocketLogger.websocketEventLog('user.delay-reservation.server', false, true);
    // FIXME: 상수 관리
    const MAX_DELAY_COUNT = 2;
    const DELAY_MINUTE = 5;
    try {
      const reservation = await this.reservationService.getReservationById(reservationId);
      const { estimatedTime, delayCount, store } = reservation;
      if (delayCount < MAX_DELAY_COUNT) {
        const delayedTime = this.dateUtilService.addMinute([DELAY_MINUTE], estimatedTime);
        const delayedCount = delayCount + 1;
        await this.reservationService.updateEstimatedTimeForDelay(
          reservationId,
          delayedTime,
          delayedCount,
        );
        const storeSocketId = storeOnlineMap[store.id];
        socket
          .to(storeSocketId)
          .emit('server.delay-reservation.store', { reservationId, estimatedTime: delayedTime });
        this.websocketLogger.websocketEventLog('server.delay-reservation.store', true, true);

        return {
          isSuccess: true,
          count: delayedCount,
          estimatedTime: delayedTime,
        };
      } else {
        return { isSuccess: false, count: MAX_DELAY_COUNT };
      }
    } catch (e) {
      this.websocketLogger.websocketEventLog('server.delay-reservation.store', true, false);
      this.websocketLogger.error(e);
      return { isSuccess: false };
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

      const userSocketId = userOnlineMap[userId];
      socket.to(userSocketId).emit('server.check-in.user', reservationId);
      this.websocketLogger.websocketEventLog('server.check-in.user', true, true);
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
    if (!(userId in userOnlineMap)) {
      return {
        reservationId,
        isSuccess: true,
      };
    }
    const userSocketId = userOnlineMap[userId];

    try {
      socket.to(userSocketId).emit('server.cancel-reservation.user', reservationId);

      this.websocketLogger.websocketEventLog('server.cancel-reservation.user', true, true);
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

  @SubscribeMessage('user.cancel-reservation.server')
  async cancelReservationUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() reservationId: number,
  ) {
    this.websocketLogger.websocketEventLog('user.cancel-reservation.server', false, true);
    const reservation = await this.reservationService.getReservationById(reservationId);
    const storeId = reservation.store.id;
    if (!(storeId in storeOnlineMap)) {
      return {
        reservationId,
        isSuccess: true,
      };
    }
    const storeSocketId = storeOnlineMap[storeId];

    try {
      socket.to(storeSocketId).emit('server.cancel-reservation.store', reservationId);

      this.websocketLogger.websocketEventLog('server.cancel-reservation.store', true, true);
    } catch (e) {
      this.websocketLogger.websocketEventLog('server.cancel-reservation.store', true, false);
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
