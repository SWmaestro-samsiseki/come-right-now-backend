import { Module } from '@nestjs/common';
import { BusinessHourController } from './business-hour.controller';
import { BusinessHourService } from './business-hour.service';

@Module({
  controllers: [BusinessHourController],
  providers: [BusinessHourService],
})
export class BusinessHourModule {}
