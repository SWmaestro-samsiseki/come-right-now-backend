import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from 'src/enum/reservation-status.enum';
import { StoreForPublicDTO } from 'src/store/dto/store-for-public.dto';
import { User } from 'src/user/user.entity';

export class ReservationDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  numberOfPeople: number;

  @ApiProperty()
  estimatedTime: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    enum: ReservationStatus,
  })
  reservationStatus: ReservationStatus;

  @ApiProperty()
  delayCount: number;

  @ApiProperty({
    type: User,
  })
  user: User;

  @ApiProperty({
    type: () => StoreForPublicDTO,
  })
  store: StoreForPublicDTO;

  @ApiProperty()
  departureTime: Date;

  @ApiProperty()
  arrivalTime: Date;
}
