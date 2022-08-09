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
import { UserService } from 'src/user/user.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { createReservationDTO } from 'src/reservation/dto/create-reservation.dto';
import { ReservationStatus } from 'src/enum/reservation-status.enum';

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
    private readonly reservationService: ReservationService,
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
    const userId = socket.data.uuid;
    const distance = 500;
    const {
      categories,
      numberOfPeople,
      delayMinutes,
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
    // 2. 주점으로 이벤트 전송
    for (const store of stores) {
      try {
        const storeSocketId = storeOnlineMap[store.id];
        const estimatedTime = await this.dateUtilService.getEstimatedTime(
          latitude,
          longitude,
          store.latitude,
          store.longitude,
          delayMinutes,
        );
        const createReservationDTO: createReservationDTO = {
          numberOfPeople,
          estimatedTime,
          userId,
          storeId: store.id,
        };
        const reservationId = await this.reservationService.createReservation(createReservationDTO);
        socket.to(storeSocketId).emit('server.find-store.store', reservationId);
      } catch (e) {
        console.log(e);
        return false;
      }
    }

    return true;
  }

  @SubscribeMessage('store.accept-seat.server')
  async acceptSeatEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { reservationId: number; userId: string },
  ) {
    const { userId, reservationId } = data;
    try {
      const reservation = await this.reservationService.getReservationById(reservationId);
      // TODO: createAt 칼럼 생성 후 응답 시간 만료 2차 확인
      const { reservationStatus } = reservation;
      if (reservationStatus !== ReservationStatus.REQUESTED) {
        return {
          isSuccess: false,
          message: '이미 처리된 요청입니다.',
        };
      }
      await this.reservationService.updateReservationStatus(reservationId, 'PENDING');
      const userSocketId = storeOnlineMap[userId];
      socket.to(userSocketId).emit('server.available-seat.user', reservationId);
      return {
        isSuccess: true,
      };
    } catch (e) {
      console.log(e);
      return {
        isSuccess: false,
        message: '만료된 요청입니다.',
      };
    }
  }
}
