import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeDeal } from 'src/time-deal/time-deal.entity';
import { TimeDealModule } from 'src/time-deal/time-deal.module';
import { User } from 'src/user/user.entity';
import { ParticipantController } from './participant.controller';
import { Participant } from './participant.entity';
import { ParticipantService } from './participant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Participant, TimeDeal, User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => TimeDealModule),
  ],
  controllers: [ParticipantController],
  providers: [ParticipantService],
  exports: [ParticipantService],
})
export class ParticipantModule {}
