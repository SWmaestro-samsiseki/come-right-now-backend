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

  @SubscribeMessage('findStore')
  async findStore(@ConnectedSocket() socket: Socket, @MessageBody() data: findStoreDTO) {
    const candidateStores = await this.storeService.findCandidateStores(
      data.longitude,
      data.latitude,
      data.categories,
      500, // test 500meter
    );
    const user = await this.userService.findUser(data.userId);
    const { numberOfPeople, arrivedAt } = data;

    for (let i = 0; i < candidateStores.length; i++) {
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
