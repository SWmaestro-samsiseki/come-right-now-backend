import {
  WebSocketGateway,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { StoreService } from 'src/store/store.service';
import { DateUtilService } from 'src/date-util/date-util.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { CreateReservationDTO } from 'src/reservation/dto/create-reservation.dto';
import { WebsocketLogger } from 'src/logger/logger.service';
import { Inject } from '@nestjs/common';
import { FindStoreDTO } from './dto/find-store.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class UserEventsGateway {
  constructor(
    private readonly storeService: StoreService,
    private readonly dateUtilService: DateUtilService,
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

  private async saveSeatCheckRequest(
    userLatitude: number,
    userLongitude: number,
    storeLatitude: number,
    storeLongitude: number,
    delayMinutes: number,
    numberOfPeople: number,
    userId: string,
    storeId: string,
  ): Promise<number> {
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

  // finsStoresNearUser: 근처에 주점이 없는 것은 에러가 아님. 로직임. 에러 처리 없이 기존대로 반환(반환값 변화없음)
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
  // @SubscribeMessage('user.find-store-further.server')
  // async userFindStoreToServerFurther(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() findStoreDTO: FindStoreDTO,
  // ) {
  //   try {
  //     this.websocketLogger.websocketEventLog('user.find-store.server', false, true);
  //     const userId = socket.data.uuid;
  //     const { categories, numberOfPeople, delayMinutes, longitude, latitude } = findStoreDTO;

  //     const stores = await this.storeService.findStoresNearUser(
  //       longitude,
  //       latitude,
  //       categories,
  //       0,
  //       500,
  //     );

  //     let onlineStoreFlag = false;

  //     for (const store of stores) {
  //       if (!(store.id in this.storeOnlineMap)) {
  //         continue;
  //       }

  //       if (!onlineStoreFlag) {
  //         onlineStoreFlag = true;
  //       }

  //       const reservationId = await this.saveSeatCheckRequest(
  //         latitude,
  //         longitude,
  //         store.latitude,
  //         store.longitude,
  //         delayMinutes,
  //         numberOfPeople,
  //         userId,
  //         store.id,
  //       );

  //       const storeSocketId = this.storeOnlineMap[store.id];
  //       this.emitSocketEvent(socket, storeSocketId, 'server.find-store.store', reservationId);
  //     }
  //     if (!onlineStoreFlag) {
  //       this.websocketLogger.websocketEventLog('server.find-store.store', true, false);
  //       this.websocketLogger.error('no online store in condition');
  //       return {
  //         isSuccess: false,
  //         message: '주변에 가게가 없습니다.',
  //       };
  //     }

  //     return {
  //       isSuccess: true,
  //     };
  //   } catch (e) {
  //     this.websocketLogger.websocketEventLog('server.find-store.store', true, false);
  //     this.websocketLogger.error(e);
  //     return {
  //       isSuccess: false,
  //       message: '잠시 후에 다시 탐색하세요.',
  //     };
  //   }
  // }

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
