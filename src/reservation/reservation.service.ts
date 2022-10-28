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
      createdAt: this.dateUtilService.parseDate(String(reservation.createdAt)),
      reservationStatus: reservation.reservationStatus,
      delayCount: reservation.delayCount,
      user: reservation.user,
      store: storeObj as StoreForPublicDTO,
      departureTime: this.dateUtilService.addMinute(
        [reservation.delayMinutes],
        reservation.createdAt,
      ),
      arrivalTime: reservation.arrivalTime,
    };

    return result;
  }

  async getReservationsByUserId(
    status: string,
    userId: string,
    orderby = 'default',
  ): Promise<ReservationDTO[]> {
    if (orderby === 'date') {
      const reservationStatus = ReservationStatus[status.toUpperCase()];

      const reservations = await this.reservationRepository
        .createQueryBuilder('r')
        .select([
          'r.id',
          'r.numberOfPeople',
          'r.estimatedTime',
          'r.createdAt',
          'r.reservationStatus',
          'r.delayMinutes',
          'r.arrivalTime',
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
          id: userId,
          status: reservationStatus,
        })
        .orderBy('r.arrivalTime', 'DESC')
        .getMany();

      if (reservations.length === 0) {
        throw new NotFoundException('no reservation');
      }
      console.log(reservations);
      const result = reservations.map((r) => this.filterPrivateReservationData(r));
      return result;
    }
    const reservationStatus = ReservationStatus[status.toUpperCase()];

    const reservation = await this.reservationRepository
      .createQueryBuilder('r')
      .select([
        'r.id',
        'r.numberOfPeople',
        'r.estimatedTime',
        'r.createdAt',
        'r.reservationStatus',
        'r.delayMinutes',
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
        id: userId,
        status: reservationStatus,
      })
      .getOne();

    if (!reservation) {
      throw new NotFoundException('no reservation');
    }

    const result: ReservationDTO = this.filterPrivateReservationData(reservation);
    return [result];
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
    const { numberOfPeople, storeId, estimatedTime, userId, delayMinutes } = createReservationDTO;
    const nowDate = this.dateUtilService.getNowDate();

    const reservation = this.reservationRepository.create({
      reservationStatus: ReservationStatus.REQUESTED,
      createdAt: nowDate,
      numberOfPeople,
      estimatedTime,
      delayMinutes,
    });

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

  // FIXME: status string값 수정
  async updateReservationStatus(reservationId: number, status: string) {
    const reservationStatus = ReservationStatus[status];
    const result = await this.reservationRepository.update(reservationId, { reservationStatus });

    if (result.affected === 0) {
      throw new NotFoundException();
    }
  }

  // FIXME: Exception error 중복 코드 해결

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
      throw new NotFoundException('해당 예약 건이 존재하지 않습니다.');
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
      throw new NotFoundException('해당 예약 건이 존재하지 않습니다.');
    }
  }

  async getReservationByUserIdByDateOrder(
    status: string,
    userId: string,
  ): Promise<ReservationDTO[][]> {
    const reservations = await this.getReservationsByUserId(status, userId, 'date');
    const result = [];
    for (const reservation of reservations) {
      const arrivalTime = reservation.arrivalTime;
      if (result.length !== 0) {
        const lastReservationArrivalTime = result[result.length - 1][0].arrivalTime;
        if (
          this.dateUtilService.compareDateAndMonthAndYear(arrivalTime, lastReservationArrivalTime)
        ) {
          result[result.length - 1].push(reservation);
          continue;
        }
      }
      result.push([reservation]);
    }

    return result;
  }
}
