import { ReservationStatus } from 'src/enum/reservation-status.enum';
import { StoreForPublicDTO } from 'src/store/dto/store-for-public.dto';
import { User } from 'src/user/user.entity';

export class ReservationDTO {
  id: number;

  numberOfPeople: number;

  estimatedTime: Date;

  createdAt: Date;

  reservationStatus: ReservationStatus;

  delayCount: number;

  user: User;

  store: StoreForPublicDTO;

  departureTime: Date;
}
