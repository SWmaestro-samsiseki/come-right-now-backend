import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { findStoreDTO } from 'src/eventDTO/findStore.dto';
import { storeIdDTO } from 'src/eventDTO/storeId.dto';
import { StoreService } from 'src/store/store.service';
import { UserService } from './user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class UserGateway {
  constructor(
    private readonly storeService: StoreService,
    private readonly userService: UserService,
  ) {}

  //#WTD-160
  @SubscribeMessage('findStore')
  async findStore(@ConnectedSocket() socket: Socket, @MessageBody() data: findStoreDTO) {
    const candidateStores = await this.storeService.findCandidateStores(
      data.longitude,
      data.latitude,
      data.categories,
      500, // 500meter 이내 stores 테스트
    );

    const user = await this.userService.findUser(data.userId);
    const { numberOfPeople, arrivedAt } = data;

    for (let i = 0; i < candidateStores.length; i++) {
      // 찾은 stores에 대하여 자리 요청 이벤트 전송
      const storeId = candidateStores[i].id;
      const storeIdData: storeIdDTO = {
        numberOfPeople,
        arrivedAt,
        userSocketId: socket.id,
        username: user.name,
        userPhone: user.phone,
        creditRate: user.creditRate,
      };
      socket.emit(`${storeId}`, storeIdData);
    }
  }
}
