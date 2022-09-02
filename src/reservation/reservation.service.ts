import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateUtilService } from 'src/date-util/date-util.service';
import { ReservationStatus } from 'src/enum/reservation-status.enum';
import { StoreForPublicDTO } from 'src/store/dto/store-for-public.dto';
import { Store } from 'src/store/store.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CreateReservationDTO } from './dto/create-reservation.dto';
import { ReservationDTO } from './dto/reservation.dto';
import { Reservation } from './reservation.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation) private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Store) private readonly storeRepository: Repository<Store>,
    private readonly dateUtilService: DateUtilService,
  ) {}

  private filterPrivateReservationData(reservation: Reservation): ReservationDTO {
    const dayOfWeekToday = this.dateUtilService.getDayOfWeekToday();
    const storeObj = Object(reservation.store);
    delete storeObj.masterName;
    delete storeObj.masterPhone;
    delete storeObj.businessNumber;
    const todayBusinessHours = reservation.store.businessHours.find(
      (b) => b.businessDay === dayOfWeekToday,
    );
    storeObj.todayOpenAt = todayBusinessHours ? todayBusinessHours.openAt : null;
    storeObj.todayCloseAt = todayBusinessHours ? todayBusinessHours.closeAt : null;

    const result: ReservationDTO = {
      id: reservation.id,
      numberOfPeople: reservation.numberOfPeople,
      estimatedTime: reservation.estimatedTime,
      createdAt: reservation.createdAt,
      reservationStatus: reservation.reservationStatus,
      delayCount: reservation.delayCount,
      user: reservation.user,
      store: storeObj as StoreForPublicDTO,
    };

    return result;
  }

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

    if (!reservation) {
      throw new NotFoundException('no reservation');
    }

    const result: ReservationDTO = this.filterPrivateReservationData(reservation);

    return result;
  }

  async getStoreReservationByStatus(status: string, storeId: string): Promise<ReservationDTO[]> {
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
    const results = [];
    for (const reservation of reservations) {
      const result: ReservationDTO = this.filterPrivateReservationData(reservation);
      results.push(result);
    }
    return results;
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
        'r.delayCount',
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

    if (!reservation) {
      throw new NotFoundException('no reservation');
    }

    const result = this.filterPrivateReservationData(reservation);

    return result;
  }

  async updateReservationStatus(reservationId: number, status: string) {
    const reservationStatus = ReservationStatus[status];
    const result = await this.reservationRepository.update(reservationId, { reservationStatus });

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }

  async deleteReservation(reservationId: number): Promise<boolean> {
    const result = await this.reservationRepository.delete({ id: reservationId });

    if (result.affected === 0) {
      throw new NotFoundException('해당 예약 건이 존재하지 않습니다.');
    }

    return true;
  }

  async updateEstimatedTimeForDelay(
    reservationId: number,
    estimatedTime: Date,
    delayCount: number,
  ) {
    const result = await this.reservationRepository.update(reservationId, {
      estimatedTime,
      delayCount,
    });

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }

  async updateArrivalForCheckIn(reservationId: number) {
    const nowDate = this.dateUtilService.getNowDate();
    const reservationStatus = ReservationStatus.ARRIVED;
    const result = await this.reservationRepository.update(reservationId, {
      arrivalTime: nowDate,
      reservationStatus,
    });

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }
}
