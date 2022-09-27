import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
  Patch,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Account } from 'src/account/account.entity';
import { getAccount } from 'src/account/get-account.decorator';
import { UserTimeDealsDTO } from './dto/user-time-deals.dto';
import { TimeDealService } from './time-deal.service';

@Controller('time-deal')
export class TimeDealController {
  reservationService: any;
  constructor(private readonly timeDealService: TimeDealService) {}

  @Get('store')
  async getStoreTimeDeal(@Query('storeId') storeId: string) {
    await this.timeDealService.checkTimeDealValidation();
    return await this.timeDealService.getStoreTimeDeal(storeId);
  }

  @Get('user')
  async getUserTimeDeals(
    @Query('latitude') userLatitude: number,
    @Query('longitude') userLongitude: number,
  ) {
    await this.timeDealService.checkTimeDealValidation();
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

  @Patch(':id/close')
  async closeTimeDeal(@Param('id') timeDealId: number): Promise<Number> {
    return await this.timeDealService.closeTimeDeal(timeDealId);
  }

  @Get('userDeals')
  @UseGuards(AuthGuard())
  async getTimeDealsByUserId(
    @getAccount() account: Account,
    @Query() data: { latitude: number; longitude: number },
  ): Promise<UserTimeDealsDTO> {
    const userId = account.id;
    const { longitude, latitude } = data;
    return await this.timeDealService.getTimeDealsByUserId(userId, longitude, latitude);
  }
}
