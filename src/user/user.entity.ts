import { Reservation } from 'src/reservation/reservation.entity';
import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn(/*'increment'*/)
  public userId: number;

  @Column({ type: 'varchar', length: 30, nullable: false })
  public userEmail: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  public userPassword: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  public userName: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  public userPhone: string;

  @Column({ type: 'varchar', length: 6, nullable: false })
  public userBirthDate: string;

  @Column({ type: 'int', nullable: false })
  public creditRate: number;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  public reservations: Reservation[];
}
