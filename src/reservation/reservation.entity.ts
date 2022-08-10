import { ApiProperty } from '@nestjs/swagger';
import { Store } from 'src/store/store.entity';
import { User } from 'src/user/user.entity';
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ReservationStatus } from '../enum/reservation-status.enum';

@Entity()
export class Reservation extends BaseEntity {
  @PrimaryGeneratedColumn(/*'increment'*/)
  @ApiProperty()
  public id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty()
  public numberOfPeople: number;

  @Column({ type: 'datetime', nullable: false })
  @ApiProperty()
  public estimatedTime: Date;

  @Column({ type: 'datetime', nullable: true })
  @ApiProperty()
  public arrivalTime: Date;

  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.RESERVED })
  @ApiProperty()
  public reservationStatus: ReservationStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @ApiProperty()
  public reservedTable: string;

  @ManyToOne(() => User, (user) => user.reservations, {
    createForeignKeyConstraints: false,
  })
  user: User;

  @ManyToOne(() => Store, (store) => store.reservations, {
    createForeignKeyConstraints: false,
  })
  store: Store;

  @Column()
  @ApiProperty()
  createdAt: Date;
}
