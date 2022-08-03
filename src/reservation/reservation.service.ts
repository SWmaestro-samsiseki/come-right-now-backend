import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationStatus } from 'src/enum/reservation-status.enum';
import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation) private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async getReservationByUserId(userId: string) {
    const reservation = await this.reservationRepository.findOne({
      relations: ['user', 'store'],
      where: {
        user: {
          id: userId,
        },
        reservationStatus: ReservationStatus.RESERVED,
      },
    });

    return reservation;
  }

  async getStoreReservationByStatus(type: string, storeId: string) {
    let reservedStatus: ReservationStatus;

    if (type === 'pending') {
      reservedStatus = ReservationStatus.PENDING;
    } else if (type === 'reserved') {
      reservedStatus = ReservationStatus.RESERVED;
    }

    const reservations = await this.reservationRepository.find({
      relations: ['user', 'store'],
      where: {
        store: {
          id: storeId,
        },
        reservationStatus: reservedStatus,
      },
    });

    return reservations;
  }
}
