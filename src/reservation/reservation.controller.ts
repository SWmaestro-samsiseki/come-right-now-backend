import { Controller, Get, Param, Query } from '@nestjs/common';
import { getStoreReservationDTO } from './dto/get-store-reservation.dto';
import { getUserReservedDTO } from './dto/get-user-reserved.dto';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('user/:id')
  async getUserReserved(@Query('status') status: string, @Param('id') userId: string) {
    const reservation = await this.reservationService.getReservationByUserId(status, userId);
    const getUserReservedDTO: getUserReservedDTO = {
      reservationId: reservation.id,
      arrivalTime: reservation.arrivalTime,
      numberOfPeople: reservation.peopleNumber,
      storeId: reservation.store.id,
    };

    return getUserReservedDTO;
  }

  @Get('store/:id')
  async getStoreReservedAndPending(@Query('status') status: string, @Param('id') storeId: string) {
    const reservations = await this.reservationService.getStoreReservationByStatus(status, storeId);
    const results: getStoreReservationDTO[] = [];
    for (const reservation of reservations) {
      const { estimatedTime } = reservation;
      const reservationId = reservation.id;
      const numberOfPeople = reservation.peopleNumber;
      const userName = reservation.user.name;
      const userPhone = reservation.user.phone;
      const creditRate = reservation.user.creditRate;

      const getStoreReservationDTO: getStoreReservationDTO = {
        reservationId,
        estimatedTime,
        numberOfPeople,
        userName,
        userPhone,
        creditRate,
      };

      results.push(getStoreReservationDTO);
    }

    return results;
  }
}
