import { ApiProperty } from '@nestjs/swagger';

export class CheckInInputDTO {
  @ApiProperty()
  participantId: number;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;
}
