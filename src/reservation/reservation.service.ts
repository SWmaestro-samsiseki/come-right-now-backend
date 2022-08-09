import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { setDefaultResultOrder } from 'dns';
import { ReservationStatus } from 'src/enum/reservation-status.enum';
import { Store } from 'src/store/store.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { createReservationDTO } from './dto/create-reservation.dto';
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
    const reservationStatus = ReservationStatus[status.toUpperCase()];

    const reservations = await this.reservationRepository.find({
      relations: ['user', 'store'],
      where: {
        store: {
          id: storeId,
        },
        reservationStatus,
      },
    });

    return reservations;
  }

  // async responseSeat(reservationId: number): Promise<Reservation> {
  //   return this.reservationRepository.save({
  //     id: reservationId,
  //     reservationStatus: ReservationStatus.PENDING,
  //   });
  // }

  async createReservation(createReservationDTO: createReservationDTO): Promise<number> {
    const reservation = this.reservationRepository.create();
    const { numberOfPeople, storeId, estimatedTime, userId } = createReservationDTO;

    reservation.reservationStatus = ReservationStatus.REQUESTED;
    reservation.numberOfPeople = numberOfPeople;
    reservation.estimatedTime = estimatedTime;

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
    return result.id;
  }

  async getReservationById(id: number) {
    const reservation = this.reservationRepository.findOne({
      relations: ['store', 'user'],
      where: {
        id,
      },
    });

    if (!reservation) {
      throw new NotFoundException();
    }

    return reservation;
  }

  async updateReservationStatus(reservationId: number, status: string) {
    const reservationStatus = ReservationStatus[status];
    const result = await this.reservationRepository.update(reservationId, { reservationStatus });

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }

  async deleteReservation(reservationId: number) {
    const result = await this.reservationRepository.delete({ id: reservationId });

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }
}
