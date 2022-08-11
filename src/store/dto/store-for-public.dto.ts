import { ApiProperty } from '@nestjs/swagger';
import { BusinessHour } from 'src/business-hour/business-hour.entity';

export class StoreForPublicDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  storeType: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  storePhone: string;

  @ApiProperty()
  introduce: string;

  @ApiProperty()
  storeImage: string;

  @ApiProperty()
  mainMenu1: string;

  @ApiProperty()
  mainMenu2: string;

  @ApiProperty()
  mainMenu3: string;

  @ApiProperty()
  menuImage: string;

  @ApiProperty()
  starRate: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  todayOpenAt: Date;

  @ApiProperty()
  todayCloseAt: Date;

  @ApiProperty()
  businessHours: BusinessHour[];
}
