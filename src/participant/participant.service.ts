import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantStatus } from 'src/enum/participant-status';
import { TimeDealStatus } from 'src/enum/time-deal-status';
import { TimeDeal } from 'src/time-deal/time-deal.entity';
import { TimeDealService } from 'src/time-deal/time-deal.service';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CreateParticipantOutputDTO } from './dto/create-participant.output.dto';
import { Participant } from './participant.entity';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participant) private readonly participantRepository: Repository<Participant>,
    @InjectRepository(TimeDeal) private readonly timeDealRepository: Repository<TimeDeal>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly timeDealService: TimeDealService,
  ) {}

  async createParticipant(timeDealId: number, userId: string): Promise<CreateParticipantOutputDTO> {
    const timeDeal = await this.timeDealService.findAndCheckTimeDeal(timeDealId);

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    const { id } = await this.participantRepository.save({ user, timeDeal });

    return {
      timeDealId,
      participantId: id,
    };
  }

  async deleteParticipantById(id: number) {
    const participant = await this.participantRepository.findOne({
      where: {
        id,
      },
    });
    if (!participant) {
      throw new NotFoundException();
    }

    await this.participantRepository.remove(participant);
  }
  async updateStatusForCheckInTimeDeal(participantId: number) {
    const participantStatus = ParticipantStatus.ARRIVED;
    const result = await this.participantRepository.update(participantId, {
      status: participantStatus,
    });

    if (result.affected === 0) {
      throw new NotFoundException('해당 타임딜 등록 건이 존재하지 않습니다.');
    }
  }

  async getParticipantById(participantId: number): Promise<Participant> {
    const participant = await this.participantRepository.findOne({
      where: {
        id: participantId,
      },
      relations: ['user', 'timeDeal'],
    });

    if (!participant) {
      throw new NotFoundException('타임딜 신청 정보가 없습니다.');
    }

    return participant;
  }
}
