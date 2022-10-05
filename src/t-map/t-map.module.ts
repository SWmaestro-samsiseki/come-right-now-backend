import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TMapService } from './t-map.service';

@Module({
  imports: [HttpModule],
  providers: [TMapService],
  exports: [TMapService],
})
export class TMapModule {}
