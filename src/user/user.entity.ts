import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  public id: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  @ApiProperty()
  public name: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  @ApiProperty()
  public phone: string;

  @Column({ type: 'varchar', length: 6, nullable: false })
  @ApiProperty()
  public birthDate: string;

  @Column({ type: 'int', nullable: false })
  @ApiProperty()
  public creditRate: number;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  public reservations: Reservation[];

  public account: Account;
}
