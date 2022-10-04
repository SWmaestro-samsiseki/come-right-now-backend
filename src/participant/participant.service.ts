import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeDealStatus } from 'src/enum/time-deal-status';
import { TimeDeal } from 'src/time-deal/time-deal.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Participant } from './participant.entity';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participant) private readonly participantRepository: Repository<Participant>,
    @InjectRepository(TimeDeal) private readonly timeDealRepository: Repository<TimeDeal>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAndCheckTimeDeal(timeDealId: number): Promise<TimeDeal> {
    const timeDeal = await this.timeDealRepository.findOne({
      where: {
        id: timeDealId,
      },
    });

    if (!timeDeal) {
      throw new NotFoundException('no time deal');
    }

    if (timeDeal.status === TimeDealStatus.CLOSED) {
      throw new BadRequestException('time deal is closed');
    }

    return timeDeal;
  }

  async createParticipant(timeDealId: number, userId: string) {
    const timeDeal = await this.findAndCheckTimeDeal(timeDealId);

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
}
