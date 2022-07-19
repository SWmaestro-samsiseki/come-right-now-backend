import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { StoreModule } from './store/store.module';
import { ReservationModule } from './reservation/reservation.module';
import { CategoryModule } from './category/category.module';
import { StoreTableModule } from './store-table/store-table.module';
import { BusinessOffModule } from './business-off/business-off.module';
import { BusinessHourModule } from './business-hour/business-hour.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'production' ? '.production.env' : '.development.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.TYPEORM_HOST,
      port: parseInt(process.env.TYPEORM_PORT),
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true,
    }),
    /*
    UserModule,
    StoreModule,
    ReservationModule,
    CategoryModule,
    StoreTableModule,
    BusinessOffModule,
    BusinessHourModule,
    */
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
