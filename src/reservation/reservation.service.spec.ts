import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DateUtilService } from 'src/date-util/date-util.service';
import { ReservationStatus } from 'src/enum/reservation-status.enum';
import { Store } from 'src/store/store.entity';
import { User } from 'src/user/user.entity';
import { anything, instance, mock, reset, verify, when } from 'ts-mockito';
import { Repository, UpdateResult } from 'typeorm';
import { CreateReservationDTO } from './dto/create-reservation.dto';
import { Reservation } from './reservation.entity';
import { ReservationService } from './reservation.service';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

describe('ReservationService', () => {
  let reservationService: ReservationService;

  const reservationRepository: Repository<Reservation> = mock<Repository<Reservation>>();
  const userRepository: Repository<User> = mock<Repository<User>>();
  const storeRepository: Repository<Store> = mock<Repository<Store>>();
  const dateUtilService: DateUtilService = mock<DateUtilService>();

  beforeEach(async () => {
    const iReservationRepository = instance(reservationRepository);
    const iUserRepository = instance(userRepository);
    const iStoreRepository = instance(storeRepository);
    const iDateUtilService = instance(dateUtilService);

    const app = await Test.createTestingModule({
      providers: [
        {
          provide: ReservationService,
          useFactory: () =>
            new ReservationService(
              iReservationRepository,
              iUserRepository,
              iStoreRepository,
              iDateUtilService,
            ),
        },
      ],
    }).compile();

    reservationService = app.get(ReservationService);
  });

  afterEach(async () => {
    reset(reservationRepository);
    reset(userRepository);
    reset(storeRepository);
    reset(dateUtilService);
  });

  describe('createReservation', () => {
    it('create Reservation and return reservation id', async () => {
      const fakeDate = new Date();
      const storeId = faker.datatype.uuid();
      const userId = faker.datatype.uuid();
      const createReservationDTO: CreateReservationDTO = {
        numberOfPeople: 5,
        storeId: storeId,
        estimatedTime: fakeDate,
        userId: userId,
        delayMinutes: 10,
      };
      const store = new Store();
      store.id = storeId;
      const user = new User();
      user.id = userId;
      const reservation = new Reservation();
      reservation.id = 0;
      reservation.reservationStatus = ReservationStatus.REQUESTED;
      reservation.createdAt = fakeDate;
      reservation.numberOfPeople = createReservationDTO.numberOfPeople;
      reservation.estimatedTime = createReservationDTO.estimatedTime;
      reservation.delayMinutes = createReservationDTO.delayMinutes;
      reservation.store = store;
      reservation.user = user;

      when(storeRepository.findOne(anything())).thenResolve(store);
      when(userRepository.findOne(anything())).thenResolve(user);
      when(reservationRepository.create(anything())).thenReturn(reservation as any);
      when(reservationRepository.save(anything())).thenResolve(reservation);

      const result = await reservationService.createReservation(createReservationDTO);

      expect(result).toBe(0);
    });
  });

  describe('updateReservationStatus', () => {
    it('update reservation status if reservation exists', async () => {
      const reservationId = 0;
      const status = 'PENDING';
      const updateResult = new UpdateResult();
      updateResult.affected = 1;

      when(reservationRepository.update(anything(), anything())).thenResolve(updateResult);

      await reservationService.updateReservationStatus(reservationId, status);

      verify(reservationRepository.update(anything(), anything())).once();
    });

    it('throw Not Found Exception if there is no reservation with the id', async () => {
      const reservationId = 0;
      const status = 'PENDING';
      const updateResult = new UpdateResult();
      updateResult.affected = 0;

      when(reservationRepository.update(anything(), anything())).thenResolve(updateResult);

      try {
        await reservationService.updateReservationStatus(reservationId, status);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('deleteReservation', () => {
    it('return true if reservation is deleted', async () => {
      const reservationId = 0;
      const updateResult = new UpdateResult();
      updateResult.affected = 1;

      when(reservationRepository.delete(anything())).thenResolve(updateResult);

      const result = await reservationService.deleteReservation(reservationId);
      expect(result).toBe(true);
      verify(reservationRepository.delete(anything())).once();
    });

    it('throw Not Found Exception if there is no reservation with the id', async () => {
      const reservationId = 0;
      const updateResult = new UpdateResult();
      updateResult.affected = 0;

      when(reservationRepository.delete(anything())).thenResolve(updateResult);

      try {
        await reservationService.deleteReservation(reservationId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('updateEstimatedTimeForDelay', () => {
    it('update reservation estimated time if reservation exists with the id', async () => {
      const reservationId = 0;
      const estimatedTime = new Date();
      const delayCount = 0;
      const updateResult = new UpdateResult();
      updateResult.affected = 1;

      when(reservationRepository.update(anything(), anything())).thenResolve(updateResult);

      await reservationService.updateEstimatedTimeForDelay(
        reservationId,
        estimatedTime,
        delayCount,
      );

      verify(reservationRepository.update(anything(), anything())).once();
    });

    it('throw Not Found Exception if there is no reservation with the id', async () => {
      const reservationId = 0;
      const estimatedTime = new Date();
      const delayCount = 0;
      const updateResult = new UpdateResult();
      updateResult.affected = 0;

      when(reservationRepository.update(anything(), anything())).thenResolve(updateResult);
      try {
        await reservationService.updateEstimatedTimeForDelay(
          reservationId,
          estimatedTime,
          delayCount,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('updateArrivalForCheckIn', () => {
    it('update check in state if reservation exists with the id', async () => {
      const fakeDate = new Date();
      const reservationId = 0;
      const updateResult = new UpdateResult();
      updateResult.affected = 1;

      when(dateUtilService.getNowDate()).thenReturn(fakeDate);
      when(reservationRepository.update(anything(), anything())).thenResolve(updateResult);

      await reservationService.updateArrivalForCheckIn(reservationId);

      verify(reservationRepository.update(anything(), anything())).once();
    });

    it('throw Not Found Exception if there is no reservation with the id', async () => {
      const fakeDate = new Date();
      const reservationId = 0;
      const updateResult = new UpdateResult();
      updateResult.affected = 0;

      when(dateUtilService.getNowDate()).thenReturn(fakeDate);
      when(reservationRepository.update(anything(), anything())).thenResolve(updateResult);

      try {
        await reservationService.updateArrivalForCheckIn(reservationId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
