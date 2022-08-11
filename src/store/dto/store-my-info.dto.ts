import { ApiProperty } from '@nestjs/swagger';
import { BusinessHour } from 'src/business-hour/business-hour.entity';

export class StoreMyInfoDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  masterName: string;

  @ApiProperty()
  storeName: string;

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
  masterPhone: string;

  @ApiProperty()
  introduce: string;

  @ApiProperty()
  storeImage: string;

  @ApiProperty()
  businessNumber: string;

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
  businessHours: BusinessHour[];
}
