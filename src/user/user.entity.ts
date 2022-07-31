import { Account } from 'src/account/account.entity';
import { Reservation } from 'src/reservation/reservation.entity';
import {
  Entity,
  BaseEntity,
  Column,
  OneToMany,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  @OneToOne(() => Account, (account) => account.id, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'id' })
  public id: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  public name: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  public phone: string;

  @Column({ type: 'varchar', length: 6, nullable: false })
  public birthDate: string;

  @Column({ type: 'int', nullable: false })
  public creditRate: number;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  public reservations: Reservation[];

  public account: Account;
}
