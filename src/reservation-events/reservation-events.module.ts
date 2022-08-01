import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { StoreModule } from 'src/store/store.module';
import { UserModule } from 'src/user/user.module';
import { ReservationEventsGateway } from './reservation-events.gateway';

@Module({
  imports: [StoreModule, UserModule, AccountModule],
  providers: [ReservationEventsGateway],
})
export class ReservationEventsModule {}
