import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/account/account.entity';
import { AccountModule } from 'src/account/account.module';
import { Category } from 'src/category/category.entity';
import { DateUtilModule } from 'src/date-util/date-util.module';
import { StoreController } from './store.controller';
import { Store } from './store.entity';
import { StoreService } from './store.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, Category, Account]),
    DateUtilModule,
    AccountModule,
    HttpModule,
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
