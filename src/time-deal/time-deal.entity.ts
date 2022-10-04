import { ApiProperty } from '@nestjs/swagger';
import { TimeDealStatus } from 'src/enum/time-deal-status';
import { Participant } from 'src/participant/participant.entity';
import { Store } from 'src/store/store.entity';
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TimeDeal extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  public id: number;

  @Column({ type: 'datetime', nullable: false })
  @ApiProperty()
  public endTime: Date;

  @Column({ type: 'text', nullable: false })
  @ApiProperty()
  public benefit: string;

  @Column({ type: 'enum', enum: TimeDealStatus, default: TimeDealStatus.IN_PROGRESS })
  @ApiProperty({
    enum: TimeDealStatus,
  })
  public status: TimeDealStatus;

  @ManyToOne(() => Store, (store) => store.timeDeals)
  @ApiProperty({
    type: Store,
  })
  public store: Store;

  @OneToMany(() => Participant, (participant) => participant.timeDeal)
  @ApiProperty({
    type: () => [Participant],
  })
  public participants: Participant[];
}
