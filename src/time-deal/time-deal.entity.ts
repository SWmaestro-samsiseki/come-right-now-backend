import { Participant } from 'src/participant/participant.entity';
import { Store } from 'src/store/store.entity';
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TimeDeal extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'datetime', nullable: false })
  public endTime: Date;

  @Column({ type: 'text', nullable: false })
  public benefit: string;

  @ManyToOne(() => Store, (store) => store.timeDeals)
  public store: Store;

  @OneToMany(() => Participant, (participant) => participant.timeDeal)
  public participants: Participant[];
}
