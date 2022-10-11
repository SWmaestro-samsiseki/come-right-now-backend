import { ApiProperty } from '@nestjs/swagger';

export class UserTimeDealsDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  benefit: string;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  businessName: string;

  @ApiProperty()
  storeImage: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  distance: number;

  @ApiProperty()
  participantId: number;

  @ApiProperty()
  status: number;
}
