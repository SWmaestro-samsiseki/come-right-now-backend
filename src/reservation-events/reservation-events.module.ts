import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { ReservationEventsGateway } from './reservation-events.gateway';

@Module({
  imports: [AccountModule],
  providers: [ReservationEventsGateway],
  exports: [ReservationEventsGateway],
})
export class ReservationEventsModule {}
