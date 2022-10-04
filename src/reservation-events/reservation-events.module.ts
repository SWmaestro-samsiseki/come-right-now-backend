import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { ReservationEventsGateway } from './reservation-events.gateway';
import { ReservationEventsController } from './reservation-events.controller';
import { StoreModule } from 'src/store/store.module';
import { UserModule } from 'src/user/user.module';
import { ReservationModule } from 'src/reservation/reservation.module';
import { DateUtilModule } from 'src/date-util/date-util.module';
import { LoggerModule } from 'src/logger/logger.module';
import { storeOnlineMap } from './onlineMaps/store.onlineMap';
import { userOnlineMap } from './onlineMaps/user.onlineMap';
import { NewrelicModule } from 'src/newrelic/newrelic.module';

@Module({
  imports: [
    AccountModule,
    StoreModule,
    UserModule,
    ReservationModule,
    DateUtilModule,
    ReservationModule,
    LoggerModule,
    NewrelicModule,
  ],
  providers: [
    ReservationEventsGateway,
    {
      provide: 'STORE_ONLINEMAP',
      useValue: storeOnlineMap,
    },
    {
      provide: 'USER_ONLINEMAP',
      useValue: userOnlineMap,
    },
  ],
  exports: [ReservationEventsGateway],
  controllers: [ReservationEventsController],
})
export class ReservationEventsModule {}
