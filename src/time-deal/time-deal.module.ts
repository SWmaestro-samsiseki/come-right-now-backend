import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeDealController } from './time-deal.controller';
import { TimeDeal, TimeDealStatus } from './time-deal.entity';
import { TimeDealService } from './time-deal.service';

@Module({
  imports: [TypeOrmModule.forFeature([TimeDeal])],
  controllers: [TimeDealController],
  providers: [
    TimeDealService,
    {
      provide: 'TIME_DEAL_STATUS',
      useValue: TimeDealStatus,
    },
  ],
})
export class TimeDealModule {}
