import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DateUtilModule } from 'src/date-util/date-util.module';
import { LoggerModule } from 'src/logger/logger.module';
import { ParticipantModule } from 'src/participant/participant.module';
import { StoreModule } from 'src/store/store.module';
import { TimeDealEventsGateway } from './time-deal-events.gateway';
import { TimeDealController } from './time-deal.controller';
import { TimeDeal } from './time-deal.entity';
import { TimeDealService } from './time-deal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeDeal]),
    StoreModule,
    DateUtilModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    LoggerModule,
    forwardRef(() => ParticipantModule),
  ],
  controllers: [TimeDealController],
  providers: [TimeDealService, TimeDealEventsGateway],
  exports: [TimeDealService],
})
export class TimeDealModule {}
