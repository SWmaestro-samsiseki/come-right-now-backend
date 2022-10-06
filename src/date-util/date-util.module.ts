import { Module } from '@nestjs/common';
import { TMapModule } from 'src/t-map/t-map.module';
import { DateUtilService } from './date-util.service';

@Module({
  imports: [TMapModule],
  providers: [DateUtilService],
  exports: [DateUtilService],
})
export class DateUtilModule {}
