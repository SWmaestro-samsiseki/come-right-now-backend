import { ParticipantStatus } from 'src/enum/participant-status';
import { TimeDeal } from 'src/time-deal/time-deal.entity';
import { User } from 'src/user/user.entity';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Participant extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'enum', enum: ParticipantStatus, default: ParticipantStatus.REQUESTED })
  public status: ParticipantStatus;

  @ManyToOne(() => User, (user) => user.participants)
  public user: User;

  @ManyToOne(() => TimeDeal, (timeDeal) => timeDeal.participants)
  public timeDeal: TimeDeal;
}
