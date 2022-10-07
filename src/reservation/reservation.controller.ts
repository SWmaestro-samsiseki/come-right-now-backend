import { Controller, Delete, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ReservationDTO } from './dto/reservation.dto';
import { ReservationService } from './reservation.service';

@ApiTags('reservation')
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @ApiOkResponse({
    description: 'ReservationDTO[]',
    type: [ReservationDTO],
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @Get('user/:id')
  async getReservationByUserId(
    @Query('status') status: string,
    @Query('order') order: string | undefined,
    @Param('id') userId: string,
  ): Promise<ReservationDTO[] | ReservationDTO[][]> {
    if (order === 'date') {
      const reservations = await this.reservationService.getReservationByUserIdByDateOrder(
        status,
        userId,
      );

      return reservations;
    }
    const reservations = await this.reservationService.getReservationsByUserId(status, userId);

    return reservations;
  }

  @ApiOkResponse({
    description: 'ReservationDTO[]',
    type: [ReservationDTO],
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @Get('store/:id')
  async getStoreReservedAndPending(
    @Query('status') status: string,
    @Param('id') storeId: string,
  ): Promise<ReservationDTO[]> {
    const reservations = await this.reservationService.getStoreReservationByStatus(status, storeId);

    return reservations;
  }

  @ApiOkResponse({
    description: 'ReservationDTO',
    type: ReservationDTO,
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @Get(':id')
  async getReservationById(@Param('id', ParseIntPipe) id: number) {
    return await this.reservationService.getReservationById(id);
  }

  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Token',
  })
  @ApiOkResponse({
    description: 'Success',
    type: 'true',
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @Delete(':id')
  async deleteReservation(@Param('id') reservationId: number): Promise<boolean> {
    return await this.reservationService.deleteReservation(reservationId);
  }
}
