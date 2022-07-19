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
export class BusinessOff extends BaseEntity {
  @PrimaryGeneratedColumn(/*'increment'*/)
  public businessOffId: number;

  @ManyToOne(() => Store, (store) => store.holidays)
  store: Store;

  @Column({ type: 'enum', enum: DayOfWeek, nullable: false })
  public offDay: DayOfWeek;

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
