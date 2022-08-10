import { ApiProperty } from '@nestjs/swagger';

export class createReservationDTO {
  @ApiProperty()
  numberOfPeople: number;

  @ApiProperty()
  estimatedTime: Date;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  userId: string;
}
