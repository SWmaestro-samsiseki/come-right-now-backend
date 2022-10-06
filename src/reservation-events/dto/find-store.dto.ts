import { ApiProperty } from '@nestjs/swagger';

export class FindStoreDTO {
  @ApiProperty()
  categories: number[];

  @ApiProperty()
  numberOfPeople: number;

  @ApiProperty()
  delayMinutes: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  latitude: number;
}
