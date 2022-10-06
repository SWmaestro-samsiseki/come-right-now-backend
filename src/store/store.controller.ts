import { Controller, Get, Param, ParseFloatPipe, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { getAccount } from 'src/account/get-account.decorator';
import { GetDistanceDTO } from './dto/get-distance.dto';
import { StoreForPublicDTO } from './dto/store-for-public.dto';
import { Store } from './store.entity';
import { StoreService } from './store.service';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiOkResponse({
    description: 'StoreForPublicDTO',
    type: StoreForPublicDTO,
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @Get(':id/info')
  async getStoreInfoById(@Param('id') id: string): Promise<StoreForPublicDTO> {
    const store = await this.storeService.getStoreByIdForPublic(id);

    return store;
  }

  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Token',
  })
  @ApiOkResponse({
    description: 'Store',
    type: Store,
  })
  @Get('my-info')
  @UseGuards(AuthGuard())
  async getStoreMyInfo(@getAccount() account): Promise<Store> {
    const { id } = account;
    const store = await this.storeService.getStoreById(id);

    return store;
  }

  @ApiOkResponse({
    type: GetDistanceDTO,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @Get(':id/distance')
  async getDistance(
    @Param('id') id: string,
    @Query('latitude', ParseFloatPipe) userLatitude: number,
    @Query('longitude', ParseFloatPipe) userLongitude: number,
  ): Promise<GetDistanceDTO> {
    const store = await this.storeService.getStoreById(id);

    const distance = await this.storeService.getDistanceMeterFromTmap(
      userLatitude,
      userLongitude,
      store.latitude,
      store.longitude,
    );

    return {
      distanceMeter: distance,
    };
  }
}
