import { DayOfWeek } from 'src/enum/days-of-week.enum';
import { Store } from 'src/store/store.entity';
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class BusinessHour extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: number;

  @Column({ type: 'enum', enum: DayOfWeek, nullable: false })
  public businessDay: DayOfWeek;

  @Column({ type: 'time', nullable: false })
  public openAt: Date;

  @Column({ type: 'time', nullable: false })
  public closeAt: Date;

  @ManyToOne(() => Store, (store) => store.businessHours, {
    createForeignKeyConstraints: false,
  })
  store: Store;
}
