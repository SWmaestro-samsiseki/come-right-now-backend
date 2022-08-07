import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DateUtilService } from './date-util.service';

@Module({
  imports: [HttpModule],
  providers: [DateUtilService],
  exports: [DateUtilService],
})
export class DateUtilModule {}
