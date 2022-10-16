import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { DateUtilModule } from 'src/date-util/date-util.module';
import { LoggerModule } from 'src/logger/logger.module';
import { ReservationEventsModule } from 'src/reservation-events/reservation-events.module';
import { ReservationModule } from 'src/reservation/reservation.module';
import { StoreModule } from 'src/store/store.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserEventsGateway } from './user.gateway';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AccountModule,
    StoreModule,
    DateUtilModule,
    ReservationModule,
    LoggerModule,
    ReservationEventsModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserEventsGateway],
  exports: [UserService],
})
export class UserModule {}
