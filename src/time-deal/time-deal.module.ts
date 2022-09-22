import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DateUtilModule } from 'src/date-util/date-util.module';
import { StoreModule } from 'src/store/store.module';
import { TimeDealController } from './time-deal.controller';
import { TimeDeal } from './time-deal.entity';
import { TimeDealService } from './time-deal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeDeal]),
    StoreModule,
    DateUtilModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TimeDealController],
  providers: [TimeDealService],
})
export class TimeDealModule {}
