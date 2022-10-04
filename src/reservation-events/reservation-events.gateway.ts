import {
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AccountService } from 'src/account/account.service';
import { StoreService } from 'src/store/store.service';
import { DateUtilService } from 'src/date-util/date-util.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { CreateReservationDTO } from 'src/reservation/dto/create-reservation.dto';
import { ReservationStatus } from 'src/enum/reservation-status.enum';
import { WebsocketLogger } from 'src/logger/logger.service';
import { Inject, UseInterceptors } from '@nestjs/common';
import { NewrelicWebsocketInterceptor } from 'src/newrelic/newrelic.websocket.interceptor';
import { FindStoreDTO } from './dto/find-store.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
@UseInterceptors(NewrelicWebsocketInterceptor)
export class ReservationEventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly accountService: AccountService,
    private readonly storeService: StoreService,
    private readonly dateUtilService: DateUtilService,
    private readonly reservationService: ReservationService,
    private readonly websocketLogger: WebsocketLogger,
    @Inject('STORE_ONLINEMAP') private storeOnlineMap: Record<string, string>,
    @Inject('USER_ONLINEMAP') private userOnlineMap: Record<string, string>,
  ) {
    this.websocketLogger.setContext('reservation-events');
  }

  private emitSocketEvent(socket: Socket, targetSocketId: string, eventName: string, data: any) {
    socket.to(targetSocketId).emit(eventName, data);
    this.websocketLogger.websocketEventLog(eventName, true, true);
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

  async saveSeatCheckRequest(
    userLatitude,
    userLongitude,
    storeLatitude,
    storeLongitude,
    delayMinutes,
    numberOfPeople,
    userId,
    storeId,
  ) {
    const estimatedTime = await this.dateUtilService.getEstimatedTime(
      userLatitude,
      userLongitude,
      storeLatitude,
      storeLongitude,
      delayMinutes,
    );
    const createReservationDTO: CreateReservationDTO = {
      numberOfPeople,
      estimatedTime,
      userId,
      delayMinutes,
      storeId,
    };
    const reservationId = await this.reservationService.createReservation(createReservationDTO);
    return reservationId;
  }

  // 근처에 주점이 없는 것은 에러가 아님. 로직임. 에러 처리 없이 기존대로 반환
  // 예상 도착 시간 계산해서 Reservation 테이블에 저장하는 역할 -> saveSeatCheckRequest
  // TODO: 재탐색 횟수에 따라 탐색 범위 조정
  @SubscribeMessage('user.find-store.server')
  async findeStoreEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() findStoreDTO: FindStoreDTO,
  ) {
    try {
      this.websocketLogger.websocketEventLog('user.find-store.server', false, true);
      const userId = socket.data.uuid;
      const { categories, numberOfPeople, delayMinutes, longitude, latitude } = findStoreDTO;

      const stores = await this.storeService.findStoresNearUser(
        longitude,
        latitude,
        categories,
        0,
        500,
      );

      let onlineStoreFlag = false;

      for (const store of stores) {
        if (!(store.id in this.storeOnlineMap)) {
          continue;
        }

        if (!onlineStoreFlag) {
          onlineStoreFlag = true;
        }

        const reservationId = await this.saveSeatCheckRequest(
          latitude,
          longitude,
          store.latitude,
          store.longitude,
          delayMinutes,
          numberOfPeople,
          userId,
          store.id,
        );

        const storeSocketId = this.storeOnlineMap[store.id];
        this.emitSocketEvent(socket, storeSocketId, 'server.find-store.store', reservationId);
      }
      if (!onlineStoreFlag) {
        this.websocketLogger.websocketEventLog('server.find-store.store', true, false);
        this.websocketLogger.error('no online store in condition');
        return {
          isSuccess: false,
          message: '주변에 가게가 없습니다.',
        };
      }

      return {
        isSuccess: true,
      };
    } catch (e) {
      this.websocketLogger.websocketEventLog('server.find-store.store', true, false);
      this.websocketLogger.error(e);
      return {
        isSuccess: false,
        message: '잠시 후에 다시 탐색하세요.',
      };
    }
  }

  // TODO: 제거 (위의 findeStoreEvent와 통합)
  @SubscribeMessage('user.find-store-further.server')
  async userFindStoreToServerFurther(
    @ConnectedSocket() socket: Socket,
    @MessageBody() findStoreDTO: FindStoreDTO,
  ) {
    try {
      this.websocketLogger.websocketEventLog('user.find-store.server', false, true);
      const userId = socket.data.uuid;
      const { categories, numberOfPeople, delayMinutes, longitude, latitude } = findStoreDTO;

      const stores = await this.storeService.findStoresNearUser(
        longitude,
        latitude,
        categories,
        0,
        500,
      );

      let onlineStoreFlag = false;

      for (const store of stores) {
        if (!(store.id in this.storeOnlineMap)) {
          continue;
        }

        if (!onlineStoreFlag) {
          onlineStoreFlag = true;
        }

        const reservationId = await this.saveSeatCheckRequest(
          latitude,
          longitude,
          store.latitude,
          store.longitude,
          delayMinutes,
          numberOfPeople,
          userId,
          store.id,
        );

        const storeSocketId = this.storeOnlineMap[store.id];
        this.emitSocketEvent(socket, storeSocketId, 'server.find-store.store', reservationId);
      }
      if (!onlineStoreFlag) {
        this.websocketLogger.websocketEventLog('server.find-store.store', true, false);
        this.websocketLogger.error('no online store in condition');
        return {
          isSuccess: false,
          message: '주변에 가게가 없습니다.',
        };
      }

      return {
        isSuccess: true,
      };
    } catch (e) {
      this.websocketLogger.websocketEventLog('server.find-store.store', true, false);
      this.websocketLogger.error(e);
      return {
        isSuccess: false,
        message: '잠시 후에 다시 탐색하세요.',
      };
    }
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

  @SubscribeMessage('user.make-reservation.server')
  async makeReservationEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { storeId: string; reservationId: number },
  ): Promise<boolean> {
    this.websocketLogger.websocketEventLog('user.make-reservation.server', false, true);
    const { storeId, reservationId } = data;
    try {
      await this.reservationService.updateReservationStatus(reservationId, 'RESERVED');

      const storeSocketId = this.storeOnlineMap[storeId];
      this.emitSocketEvent(socket, storeSocketId, 'server.make-reservation.store', reservationId);
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
        const storeSocketId = this.storeOnlineMap[store.id];
        this.emitSocketEvent(socket, storeSocketId, 'server.delay-reservation.store', {
          reservationId,
          estimatedTime: delayedTime,
        });

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

  @SubscribeMessage('user.cancel-reservation.server')
  async cancelReservationUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() reservationId: number,
  ) {
    this.websocketLogger.websocketEventLog('user.cancel-reservation.server', false, true);
    const reservation = await this.reservationService.getReservationById(reservationId);
    const storeId = reservation.store.id;
    if (!(storeId in this.storeOnlineMap)) {
      return {
        reservationId,
        isSuccess: true,
      };
    }
    const storeSocketId = this.storeOnlineMap[storeId];

    try {
      this.emitSocketEvent(socket, storeSocketId, 'server.cancel-reservation.store', reservationId);
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
