import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { createReservationDTO } from './dto/create-reservation.dto';
import { Reservation } from './reservation.entity';
import { ReservationService } from './reservation.service';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get('user/:id')
  async getUserReserved(
    @Query('status') status: string,
    @Param('id') userId: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationService.getReservationByUserId(status, userId);

    return reservation;
  }

  @Get('store/:id')
  async getStoreReservedAndPending(
    @Query('status') status: string,
    @Param('id') storeId: string,
  ): Promise<Reservation[]> {
    const reservations = await this.reservationService.getStoreReservationByStatus(status, storeId);

    return reservations;
  }

  @Post()
  async createReservations(@Body() createReservationDTOArray: createReservationDTO[]) {
    for (const createReservationDTO of createReservationDTOArray) {
      await this.reservationService.createReservation(createReservationDTO);
    }
  }

  @Get(':reservationId')
  async getReservationById(@Param('id', ParseIntPipe) id: number) {
    return await this.reservationService.getReservationById(id);
  }

  @Delete(':id')
  async deleteReservation(@Param('id') reservationId: number): Promise<boolean> {
    try {
      await this.reservationService.deleteReservation(reservationId);
      return true;
    } catch (e) {
      return false;
    }
  }
}
