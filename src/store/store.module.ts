import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/account/account.entity';
import { AccountModule } from 'src/account/account.module';
import { Category } from 'src/category/category.entity';
import { DateUtilModule } from 'src/date-util/date-util.module';
import { ReservationModule } from 'src/reservation/reservation.module';
import { TMapModule } from 'src/t-map/t-map.module';
import { StoreController } from './store.controller';
import { Store } from './store.entity';
import { StoreEventsGateway } from './store.gateway';
import { StoreService } from './store.service';
import { LoggerModule } from '../logger/logger.module';
import { ReservationEventsModule } from 'src/reservation-events/reservation-events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, Category, Account]),
    DateUtilModule,
    AccountModule,
    TMapModule,
    ReservationModule,
    LoggerModule,
    ReservationEventsModule,
  ],
  controllers: [StoreController],
  providers: [StoreService, StoreEventsGateway],
  exports: [StoreService],
})
export class StoreModule {}
