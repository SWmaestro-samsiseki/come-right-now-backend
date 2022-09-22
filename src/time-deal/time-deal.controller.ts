import { Body, Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
  @UseGuards(AuthGuard())
  async createTimeDeal(
    @Request() req,
    @Body('duration') duration: number,
    @Body('benefit') benefits: string,
  ) {
    const storeId = req.user.id;
    return await this.timeDealService.createTimeDeal(duration, benefits, storeId);
  }
}
