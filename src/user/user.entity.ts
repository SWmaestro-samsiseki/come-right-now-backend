import { Reservation } from 'src/reservation/reservation.entity';
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  public email: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  public password: string;

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
}
