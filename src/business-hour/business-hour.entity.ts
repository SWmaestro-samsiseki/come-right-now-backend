import { DayOfWeek } from 'src/enum/days-of-week.enum';
import { Store } from 'src/store/store.entity';
import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';

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

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public deletedAt: Date;
}
