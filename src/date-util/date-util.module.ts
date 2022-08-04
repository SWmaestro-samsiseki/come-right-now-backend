import { Module } from '@nestjs/common';
import { DateUtilService } from './date-util.service';

@Module({
  providers: [DateUtilService],
  exports: [DateUtilService],
})
export class DateUtilModule {}
