import { Store } from 'src/store/store.entity';
import { User } from 'src/user/user.entity';
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ReservationStatus } from '../enum/reservation-status.enum';

@Entity()
export class Reservation extends BaseEntity {
  @PrimaryGeneratedColumn(/*'increment'*/)
  public id: number;

  @Column({ type: 'int', nullable: false })
  public peopleNumber: number;

  @Column({ type: 'timestamp', nullable: false })
  public estimatedTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  public arrivalTime: Date;

  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.RESERVED })
  public reservationStatus: ReservationStatus;

  @Column({ type: 'varchar', length: 50, nullable: false })
  public reservedTable: string;

  @ManyToOne(() => User, (user) => user.reservations, {
    createForeignKeyConstraints: false,
  })
  user: User;

  @ManyToOne(() => Store, (store) => store.reservations, {
    createForeignKeyConstraints: false,
  })
  store: Store;
}
