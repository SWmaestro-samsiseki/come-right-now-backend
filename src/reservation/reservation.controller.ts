import { Controller, Get, Query } from '@nestjs/common';
import { getUserReservedDTO } from './dto/get-user-reserved.dto';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('user')
  async getUserReserved(@Query('id') userId: string) {
    const reservation = await this.reservationService.findReservationByUserId(userId);
    const getUserReservedDTO: getUserReservedDTO = {
      arrivalTime: reservation.arrivalTime,
      numberOfPeople: reservation.peopleNumber,
      storeId: reservation.store.id,
    };

    return getUserReservedDTO;
  }
}
