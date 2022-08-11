import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessHour } from 'src/business-hour/business-hour.entity';
import { DateUtilService } from 'src/date-util/date-util.service';
import { ReservationStatus } from 'src/enum/reservation-status.enum';
import { Store } from 'src/store/store.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CreateReservationDTO } from './dto/create-reservation.dto';
import { Reservation } from './reservation.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation) private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Store) private readonly storeRepository: Repository<Store>,
    @InjectRepository(BusinessHour)
    private readonly dateUtilService: DateUtilService,
  ) {}

  async getReservationByUserId(status: string, userId: string) {
    const reservationStatus = ReservationStatus[status.toUpperCase()];

    const reservation = await this.reservationRepository
      .createQueryBuilder('r')
      .select([
        'r.id',
        'r.numberOfPeople',
        'r.estimatedTime',
        'r.createdAt',
        'r.reservationStatus',
        'u.id',
        'u.name',
        'u.phone',
        'u.birthDate',
        'u.creditRate',
        's.id',
        's.businessName',
        's.storeType',
        's.latitude',
        's.longitude',
        's.storePhone',
        's.introduce',
        's.storeImage',
        's.mainMenu1',
        's.mainMenu2',
        's.mainMenu3',
        's.menuImage',
        's.starRate',
        's.address',
        'b.id',
        'b.businessDay',
        'b.openAt',
        'b.closeAt',
      ])
      .leftJoin('r.store', 's')
      .leftJoin('r.user', 'u')
      .leftJoin('s.businessHours', 'b')
      .where('u.id = :id AND r.reservationStatus = :status', {
        status: reservationStatus,
        id: userId,
      })
      .getOne();

    console.log(reservation);

    return reservation;
  }

  async getStoreReservationByStatus(status: string, storeId: string) {
    const reservationStatus = ReservationStatus[status.toUpperCase()];

    const reservations = await this.reservationRepository
      .createQueryBuilder('r')
      .select([
        'r.id',
        'r.numberOfPeople',
        'r.estimatedTime',
        'r.createdAt',
        'r.reservationStatus',
        'u.id',
        'u.name',
        'u.phone',
        'u.birthDate',
        'u.creditRate',
        's.id',
        's.businessName',
        's.storeType',
        's.latitude',
        's.longitude',
        's.storePhone',
        's.introduce',
        's.storeImage',
        's.mainMenu1',
        's.mainMenu2',
        's.mainMenu3',
        's.menuImage',
        's.starRate',
        's.address',
        'b.id',
        'b.businessDay',
        'b.openAt',
        'b.closeAt',
      ])
      .leftJoin('r.store', 's')
      .leftJoin('r.user', 'u')
      .leftJoin('s.businessHours', 'b')
      .where('s.id = :id AND r.reservationStatus = :status', {
        id: storeId,
        status: reservationStatus,
      })
      .getMany();
    return reservations;
  }

  async createReservation(createReservationDTO: CreateReservationDTO): Promise<number> {
    const reservation = this.reservationRepository.create();
    const { numberOfPeople, storeId, estimatedTime, userId } = createReservationDTO;
    const nowDate = this.dateUtilService.getNowDate();

    reservation.reservationStatus = ReservationStatus.REQUESTED;
    reservation.numberOfPeople = numberOfPeople;
    reservation.estimatedTime = estimatedTime;
    reservation.createdAt = nowDate;

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

  async getReservationById(reservationId: number) {
    const reservation = await this.reservationRepository
      .createQueryBuilder('r')
      .select([
        'r.id',
        'r.numberOfPeople',
        'r.estimatedTime',
        'r.createdAt',
        'r.reservationStatus',
        'u.id',
        'u.name',
        'u.phone',
        'u.birthDate',
        'u.creditRate',
        's.id',
        's.businessName',
        's.storeType',
        's.latitude',
        's.longitude',
        's.storePhone',
        's.introduce',
        's.storeImage',
        's.mainMenu1',
        's.mainMenu2',
        's.mainMenu3',
        's.menuImage',
        's.starRate',
        's.address',
        'b.id',
        'b.businessDay',
        'b.openAt',
        'b.closeAt',
      ])
      .leftJoin('r.store', 's')
      .leftJoin('r.user', 'u')
      .leftJoin('s.businessHours', 'b')
      .where('r.id = :id', { id: reservationId })
      .getOne();

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
