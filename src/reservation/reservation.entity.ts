import { Store } from 'src/store/store.entity';
import { User } from 'src/user/user.entity';
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
import { ReservationStatus } from '../enum/reservation-status.enum';

@Entity()
export class Reservation extends BaseEntity {
  @PrimaryGeneratedColumn(/*'increment'*/)
  public reservationId: number;

  @Column({ type: 'int', nullable: false })
  public peopleNumber: number;

  @Column({ type: 'varchar', length: 30, nullable: false })
  public userEmail: string;

  @Column({ type: 'timestamp', nullable: false })
  public estimatedTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  public arrivalTime: Date;

  @Column({ type: 'enum', enum: ReservationStatus, default: () => 'RESERVED' })
  public reservationStatus: ReservationStatus;

  @Column({ type: 'varchar', length: 50, nullable: false })
  public reservedTable: string;

  @ManyToOne(() => User, (user) => user.reservations)
  user: User;

  @ManyToOne(() => Store, (store) => store.reservations)
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
