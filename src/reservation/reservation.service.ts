/**
 * File: reservation.service.ts
 * Description: 예약 API 비즈니스 로직
 * Revision
 * 1. [221025] 리팩토링 위한 createReservationQuery 메소드 분리
 */

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

  /**
   * 
   * @param {Reservation} reservation 설명
   * @returns {ReservationDTO} 
   */
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

  /**
   * 예약 목록 획득을 위한 공통 쿼리 객체 반환
   * @returns 
   */
  async createReservationQuery() {
    return this.reservationRepository
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
        });
  }

  async getReservationsByUserId(
    status: string,
    userId: string,
    orderby = 'default',
  ): Promise<ReservationDTO[]> {
    status = status.toUpperCase();

    const reservationStatus = ReservationStatus[status];
    const query = createReservationQuery();

    // #1. 정렬 요청
    if (orderby === 'date') {
      const reservations = await query.orderBy('r.arrivalTime', 'DESC').getMany();
      if (reservations.length === 0) {
        throw new NotFoundException('no reservation');
      }

      const result = reservations.map((r) => this.filterPrivateReservationData(r));
      return result;
    }
    // #2. 일반 예약 확인
    else {
      const reservation = await query.getOne();
      if (!reservation) {
        throw new NotFoundException('no reservation');
      }

      const result: ReservationDTO = this.filterPrivateReservationData(reservation);
      return [result];
    }
  }

  /**
   * 
   * @param status {string}
   * @param storeId {string}
   * @returns 
   */
  async getStoreReservationByStatus(status: string, storeId: string): Promise<ReservationDTO[]> {
    status = status.toUpperCase();

    const reservationStatus = ReservationStatus[status];
    const query = createReservationQuery();

    const reservations = await query.getMany();
    return reservations.map(this.filterPrivateReservationData);
  }

  /**
   * 
   * @param {CreateReservationDTO} createReservationDTO 
   * @returns 
   */
  async createReservation(createReservationDTO: CreateReservationDTO): Promise<number> {
    const { numberOfPeople, storeId, estimatedTime, userId, delayMinutes } = createReservationDTO;
    const nowDate = this.dateUtilService.getNowDate();

    // #1. 예약 정보 획득
    const reservation = this.reservationRepository.create();
    reservation.reservationStatus = ReservationStatus.REQUESTED;
    reservation.numberOfPeople = numberOfPeople;
    reservation.estimatedTime = estimatedTime;
    reservation.createdAt = nowDate;
    reservation.delayMinutes = delayMinutes;
    reservation.store = await this.storeRepository.findOne({where: {id: storeId}});
    reservation.user = await this.userRepository.findOne({where: {id: userId}});

    // #2. 예약 정보 기록
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
      throw new NotFoundException('Not found reservation.');
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
      const isFirst = result.length == 0;
      if (!isFirst) {
        const lastReservationArrivalTime = result[result.length - 1][0].arrivalTime;
        const sameDate = this.dateUtilService.compareDateAndMonthAndYear(reservation.arrivalTime, lastReservationArrivalTime);
        if (sameDate) {
          const lastItem = result[result.length - 1];
          lastItem.push(reservation);
          continue;
        }
      }
      
      result.push([reservation]);
    }

    return result;
  }
}
