import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/account/account.entity';
import { Category } from 'src/category/category.entity';
import { ReservationEventsModule } from 'src/reservation-events/reservation-events.module';
import { UserModule } from 'src/user/user.module';
import { StoreController } from './store.controller';
import { Store } from './store.entity';
import { StoreService } from './store.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, Category, Account]),
    StoreModule,
    UserModule,
    ReservationEventsModule,
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
