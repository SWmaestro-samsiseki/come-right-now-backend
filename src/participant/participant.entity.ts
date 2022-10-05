import { ApiProperty } from '@nestjs/swagger';
import { ParticipantStatus } from 'src/enum/participant-status';
import { TimeDeal } from 'src/time-deal/time-deal.entity';
import { User } from 'src/user/user.entity';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Participant extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  public id: number;

  @Column({ type: 'enum', enum: ParticipantStatus, default: ParticipantStatus.REQUESTED })
  @ApiProperty({
    enum: ParticipantStatus,
  })
  public status: ParticipantStatus;

  @ManyToOne(() => User, (user) => user.participants)
  @ApiProperty({
    type: () => User,
  })
  public user: User;

  @ManyToOne(() => TimeDeal, (timeDeal) => timeDeal.participants)
  @ApiProperty({
    type: () => TimeDeal,
  })
  public timeDeal: TimeDeal;
}
