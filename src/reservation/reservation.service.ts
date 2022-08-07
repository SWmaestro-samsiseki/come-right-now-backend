import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationStatus } from 'src/enum/reservation-status.enum';
import { Store } from 'src/store/store.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Reservation } from './reservation.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation) private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Store) private readonly storeRepository: Repository<Store>,
  ) {}

  async getReservationByUserId(status: string, userId: string) {
    if (status !== 'reserved') {
      throw new BadRequestException();
    }
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

  async getStoreReservationByStatus(status: string, storeId: string) {
    let reservedStatus: ReservationStatus;

    if (status === 'requested') {
      reservedStatus = ReservationStatus.REQUESTED;
    } else if (status === 'reserved') {
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

  async responseSeat(reservationId: number): Promise<Reservation> {
    return this.reservationRepository.save({
      id: reservationId,
      reservationStatus: ReservationStatus.PENDING,
    });
  }
  async createReservation(
    numberOfPeople: number,
    willArrivedAt: Date,
    userId: string,
    storeId: string,
  ): Promise<Reservation> {
    const reservation = this.reservationRepository.create();
    reservation.peopleNumber = numberOfPeople;
    reservation.estimatedTime = willArrivedAt;
    reservation.reservationStatus = ReservationStatus.REQUESTED;
    reservation.reservedTable = '1,2';
    const store = await this.storeRepository.findOne({
      where: {
        id: storeId,
      },
    });
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    reservation.store = store;
    reservation.user = user;
    const result = await this.reservationRepository.save(reservation);
    return result;
  }
}
