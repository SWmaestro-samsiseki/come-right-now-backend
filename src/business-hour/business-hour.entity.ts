import { DayOfWeek } from '../enum/days-of-week.enum';
import { Store } from '../store/store.entity';
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class BusinessHour extends BaseEntity {
  @PrimaryGeneratedColumn(/*'increment'*/)
  public businessHourId: number;

  @Column({ type: 'enum', enum: DayOfWeek, nullable: false })
  public businessDay: DayOfWeek;

  @Column({ type: 'time', nullable: false })
  public OpenAt: DayOfWeek;

  @Column({ type: 'time', nullable: false })
  public CloseAt: DayOfWeek;

  @ManyToOne(() => Store, (store) => store.businessHours)
  store: Store;

  public deletedAt: Date;
}
