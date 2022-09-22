import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeDeal, TimeDealStatus } from 'src/time-deal/time-deal.entity';
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

  async createParticipant(timeDealId: number, userId: string) {
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

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    const participant = this.participantRepository.create();
    participant.user = user;
    participant.timeDeal = timeDeal;

    const { id } = await this.participantRepository.save(participant);

    return {
      timeDealId,
      participantId: id,
    };
  }
}
