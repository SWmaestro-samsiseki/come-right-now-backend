import { Controller, Get, Query } from '@nestjs/common';
import { TimeDealService } from './time-deal.service';

@Controller('time-deal')
export class TimeDealController {
  constructor(private readonly timeDealService: TimeDealService) {}

  @Get('store')
  async getStoreTimeDeal(@Query('storeId') storeId: string) {
    return await this.timeDealService.getStoreTimeDeal(storeId);
  }

  @Get('user')
  async getUserTimeDeals(
    @Query('latitude') userLatitude: number,
    @Query('longitude') userLongitude: number,
  ) {
    return await this.timeDealService.getUserTimeDeals(userLatitude, userLongitude);
  }
}
