import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TimeDeal } from 'src/time-deal/time-deal.entity';
import { TimeDealService } from 'src/time-deal/time-deal.service';
import { User } from 'src/user/user.entity';
import { anything, instance, mock, reset, when, verify } from 'ts-mockito';
import { Repository, UpdateResult } from 'typeorm';
import { Participant } from './participant.entity';
import { ParticipantService } from './participant.service';

describe('ParticipantService', () => {
  let participantService: ParticipantService;

  const participantRepository: Repository<Participant> = mock<Repository<Participant>>();
  const timeDealRepository: Repository<TimeDeal> = mock<Repository<TimeDeal>>();
  const timeDealService: TimeDealService = mock<TimeDealService>();
  const userRepository: Repository<User> = mock<Repository<User>>();

  beforeEach(async () => {
    const iParticipantRepository = instance(participantRepository);
    const iTimeDealRepository = instance(timeDealRepository);
    const iUserRepository = instance(userRepository);
    const iTimeDealService = instance(timeDealService);
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ParticipantService,
          useFactory: () =>
            new ParticipantService(
              iParticipantRepository,
              iTimeDealRepository,
              iUserRepository,
              iTimeDealService,
            ),
        },
      ],
    }).compile();

    participantService = app.get(ParticipantService);
  });

  afterEach(async () => {
    reset(participantRepository);
    reset(timeDealRepository);
    reset(timeDealService);
    reset(userRepository);
  });

  describe('createParticipant', () => {
    it('return CreateParticipantOUTDto if time deal and user exists and save participant', async () => {
      const timeDealId = 0;
      const participantId = 1;
      const userId = faker.datatype.uuid();
      const user = new User();
      user.id = userId;

      when(userRepository.findOne(anything())).thenResolve(user);
      when(participantRepository.save(anything())).thenResolve({
        id: participantId,
      });

      const result = await participantService.createParticipant(timeDealId, userId);

      expect(result.timeDealId).toBe(timeDealId);
      expect(result.participantId).toBe(participantId);
      expect(verify(participantRepository.save(anything())).times(1));
    });

    it('throw Not Found Exception if no user', async () => {
      const timeDealId = 0;
      const participantId = 1;
      const userId = faker.datatype.uuid();
      const user = new User();
      user.id = userId;

      when(userRepository.findOne(anything())).thenReject(new NotFoundException());
      when(participantRepository.save(anything())).thenResolve({
        id: participantId,
      });

      try {
        await participantService.createParticipant(timeDealId, userId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    it('throw Not Found Exception if no timeDeal', async () => {
      const timeDealId = 0;
      const userId = faker.datatype.uuid();
      const user = new User();
      user.id = userId;

      when(userRepository.findOne(anything())).thenResolve(user);
      when(participantRepository.save(anything())).thenReject(new NotFoundException());

      try {
        await participantService.createParticipant(timeDealId, userId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('deleteParticipantById', () => {
    it('throw Not Found Exception if no participant', async () => {
      const participantId = 0;
      when(participantRepository.findOne(anything())).thenResolve(undefined);

      try {
        await participantService.deleteParticipantById(participantId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('updateStatusForCheckInTimeDeal', () => {
    it('throw NotFoundException if no time deal', async () => {
      const participantId = 0;
      const result = {
        affected: 0,
      };

      when(participantRepository.update(anything(), anything())).thenResolve(
        result as UpdateResult,
      );

      try {
        await participantService.updateStatusForCheckInTimeDeal(participantId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });

    describe('getParticipantById', () => {
      it('return participant if exists', async () => {
        const participantId = 0;
        const participant = new Participant();
        participant.id = participantId;

        when(participantRepository.findOne(anything())).thenResolve(participant);

        const result = await participantService.getParticipantById(participantId);

        expect(result.id).toBe(participantId);
      });

      it('throw Not Found Exception if there is no participant', async () => {
        const participantId = 0;

        when(participantRepository.findOne(anything())).thenReject(new NotFoundException());

        try {
          await participantService.getParticipantById(participantId);
        } catch (e) {
          expect(e).toBeInstanceOf(NotFoundException);
        }
      });
    });
  });
});
