import { TimeDeal } from 'src/time-deal/time-deal.entity';
import { User } from 'src/user/user.entity';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

enum TimeDealStatus {
  REQUESTED = 'REQUESTED',
  ARRIVED = 'ARRIVED',
}

@Entity()
export class Participant extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'enum', enum: TimeDealStatus, default: TimeDealStatus.REQUESTED })
  public status: TimeDealStatus;

  @ManyToOne(() => User, (user) => user.participants)
  public user: User;

  @ManyToOne(() => TimeDeal, (timeDeal) => timeDeal.participants)
  public timeDeal: TimeDeal;
}
