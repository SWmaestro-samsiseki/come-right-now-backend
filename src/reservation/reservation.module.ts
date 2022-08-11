import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessHour } from 'src/business-hour/business-hour.entity';
import { DateUtilModule } from 'src/date-util/date-util.module';
import { Store } from 'src/store/store.entity';
import { User } from 'src/user/user.entity';
import { ReservationController } from './reservation.controller';
import { Reservation } from './reservation.entity';
import { ReservationService } from './reservation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, User, Store, BusinessHour]), DateUtilModule],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
