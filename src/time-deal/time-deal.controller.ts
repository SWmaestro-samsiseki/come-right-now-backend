import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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

  @Post()
  async createTimeDeal(@Body('duration') duration: number, @Body('benefit') benefits: string) {
    //FIXME : store ID 로그인 정보 통해 가저오기
    const storeId = 'u9';
    return await this.timeDealService.createTimeDeal(duration, benefits, storeId);
  }
}
