import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDTO {
  @ApiProperty()
  numberOfPeople: number;

  @ApiProperty()
  estimatedTime: Date;

  @ApiProperty()
  storeId: string;

  @ApiProperty()
  userId: string;
}
