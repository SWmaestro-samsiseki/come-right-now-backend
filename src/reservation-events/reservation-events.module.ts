import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { ReservationEventsGateway } from './reservation-events.gateway';
import { ReservationEventsController } from './reservation-events.controller';
import { StoreModule } from 'src/store/store.module';
import { UserModule } from 'src/user/user.module';
import { ReservationModule } from 'src/reservation/reservation.module';
import { DateUtilModule } from 'src/date-util/date-util.module';

@Module({
  imports: [AccountModule, StoreModule, UserModule, ReservationModule, DateUtilModule],
  providers: [ReservationEventsGateway],
  exports: [ReservationEventsGateway],
  controllers: [ReservationEventsController],
})
export class ReservationEventsModule {}
