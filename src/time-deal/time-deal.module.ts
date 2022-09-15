import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreModule } from 'src/store/store.module';
import { TimeDealController } from './time-deal.controller';
import { TimeDeal } from './time-deal.entity';
import { TimeDealService } from './time-deal.service';

@Module({
  imports: [TypeOrmModule.forFeature([TimeDeal]), StoreModule],
  controllers: [TimeDealController],
  providers: [TimeDealService],
})
export class TimeDealModule {}
