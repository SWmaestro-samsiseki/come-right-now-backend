import { Module } from '@nestjs/common';
import { StoreModule } from 'src/store/store.module';
import { UserModule } from 'src/user/user.module';
import { ReservationEventsGateway } from './reservation-events.gateway';

@Module({
  imports: [StoreModule, UserModule],
  providers: [ReservationEventsGateway],
})
export class ReservationEventsModule {}
