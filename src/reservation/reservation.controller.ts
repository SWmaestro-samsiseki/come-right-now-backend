import { Controller, Get, Query } from '@nestjs/common';
import { getStoreReservationDTO } from './dto/get-store-reservation.dto';
import { getUserReservedDTO } from './dto/get-user-reserved.dto';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('user')
  async getUserReserved(@Query('id') userId: string) {
    const reservation = await this.reservationService.getReservationByUserId(userId);
    const getUserReservedDTO: getUserReservedDTO = {
      reservationID: reservation.id,
      arrivalTime: reservation.arrivalTime,
      numberOfPeople: reservation.peopleNumber,
      storeId: reservation.store.id,
    };

    return getUserReservedDTO;
  }

  @Get('store')
  async getStoreReservedAndPending(@Query('type') type: string, @Query('id') storeId: string) {
    const reservations = await this.reservationService.getStoreReservationByStatus(type, storeId);
    const result: getStoreReservationDTO[] = [];
    for (const reservation of reservations) {
      const { estimatedTime } = reservation;
      const reservationID = reservation.id;
      const numberOfPeople = reservation.peopleNumber;
      const userName = reservation.user.name;
      const userPhone = reservation.user.phone;
      const creditRate = reservation.user.creditRate;

      const getStoreReservationDTO: getStoreReservationDTO = {
        reservationID,
        estimatedTime,
        numberOfPeople,
        userName,
        userPhone,
        creditRate,
      };

      result.push(getStoreReservationDTO);
    }

    return result;
  }
}
