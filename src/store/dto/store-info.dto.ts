import { ApiProperty } from '@nestjs/swagger';

export class StoreInfoDTO {
  @ApiProperty()
  storeId: string;

  @ApiProperty()
  masterName: string;

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
  mainMenuImage: string;

  @ApiProperty()
  starRate: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  openAt: Date;

  @ApiProperty()
  closeAt: Date;
}
