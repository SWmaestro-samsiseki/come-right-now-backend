import { Controller, Get, Query } from '@nestjs/common';
import { TimeDealService } from './time-deal.service';

@Controller('time-deal')
export class TimeDealController {
  constructor(private readonly timeDealService: TimeDealService) {}

  @Get()
  async getStoreTimeDeal(@Query('storeId') storeId: string) {
    return await this.timeDealService.getStoreTimeDeal(storeId);
  }
}
