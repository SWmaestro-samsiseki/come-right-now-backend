import { Controller, Delete, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReservationDTO } from './dto/reservation.dto';
import { ReservationService } from './reservation.service';

@ApiTags('reservation')
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('user/:id')
  async getReservationByUserId(
    @Query('status') status: string,
    @Param('id') userId: string,
  ): Promise<ReservationDTO> {
    const reservation = await this.reservationService.getReservationByUserId(status, userId);

    return reservation;
  }

  @Get('store/:id')
  async getStoreReservedAndPending(
    @Query('status') status: string,
    @Param('id') storeId: string,
  ): Promise<ReservationDTO[]> {
    const reservations = await this.reservationService.getStoreReservationByStatus(status, storeId);

    return reservations;
  }

  @Get(':id')
  async getReservationById(@Param('id', ParseIntPipe) id: number) {
    return await this.reservationService.getReservationById(id);
  }

  @Delete(':id')
  async deleteReservation(@Param('id') reservationId: number): Promise<boolean> {
    return await this.reservationService.deleteReservation(reservationId);
  }
}
