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
import {
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Account } from 'src/account/account.entity';
import { getAccount } from 'src/account/get-account.decorator';
import { UserTimeDealsDTO } from './dto/user-time-deals.dto';
import { TimeDeal } from './time-deal.entity';
import { TimeDealService } from './time-deal.service';

@ApiTags('time-deal')
@Controller('time-deal')
export class TimeDealController {
  reservationService: any;
  constructor(private readonly timeDealService: TimeDealService) {}

  @ApiOkResponse({
    description: 'TimeDeal',
    type: TimeDeal,
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @Get('store')
  async getStoreTimeDeal(@Query('storeId') storeId: string): Promise<TimeDeal> {
    await this.timeDealService.checkTimeDealValidation();
    return await this.timeDealService.getStoreTimeDeal(storeId);
  }

  @ApiOkResponse({
    description: 'TimeDeal[]',
    type: [TimeDeal],
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @Get('user')
  async getUserTimeDeals(
    @Query('latitude') userLatitude: number,
    @Query('longitude') userLongitude: number,
  ): Promise<TimeDeal[]> {
    await this.timeDealService.checkTimeDealValidation();
    return await this.timeDealService.getUserTimeDeals(userLatitude, userLongitude);
  }

  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Token',
  })
  @ApiCreatedResponse({
    description: 'TimeDeal',
    type: TimeDeal,
  })
  @Post()
  @UseGuards(AuthGuard())
  async createTimeDeal(
    @Request() req: any,
    @Body('duration') duration: number,
    @Body('benefit') benefits: string,
  ) {
    const storeId = req.user.id;
    return await this.timeDealService.createTimeDeal(duration, benefits, storeId);
  }

  @ApiOkResponse({
    description: 'timeDealId',
    type: String,
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @Patch(':id/close')
  async closeTimeDeal(@Param('id') timeDealId: number): Promise<number> {
    return await this.timeDealService.closeTimeDeal(timeDealId);
  }

  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Token',
  })
  @ApiOkResponse({
    description: 'UserTImeDealDTO',
    type: UserTimeDealsDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
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
