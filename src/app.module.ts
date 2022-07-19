import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeORMConfig } from './config/typeorm.config';
import { UserModule } from './user/user.module';
import { StoreModule } from './store/store.module';
import { ReservationModule } from './reservation/reservation.module';
import { CategoryModule } from './category/category.module';
import { StoreTableModule } from './store-table/store-table.module';
import { BusinessOffModule } from './business-off/business-off.module';
import { BusinessHourModule } from './business-hour/business-hour.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    UserModule,
    StoreModule,
    ReservationModule,
    CategoryModule,
    StoreTableModule,
    BusinessOffModule,
    BusinessHourModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
