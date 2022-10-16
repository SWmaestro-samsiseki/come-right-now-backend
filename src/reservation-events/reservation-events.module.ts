import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account/account.module';
import { ReservationEventsGateway } from './reservation-events.gateway';
import { ReservationEventsController } from './reservation-events.controller';
import { LoggerModule } from 'src/logger/logger.module';
import { storeOnlineMap } from './onlineMaps/store.onlineMap';
import { userOnlineMap } from './onlineMaps/user.onlineMap';

@Module({
  imports: [AccountModule, LoggerModule],
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
  controllers: [ReservationEventsController],
  exports: ['STORE_ONLINEMAP', 'USER_ONLINEMAP'],
})
export class ReservationEventsModule {}
