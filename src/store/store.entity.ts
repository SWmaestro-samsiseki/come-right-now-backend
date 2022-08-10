import { ApiProperty } from '@nestjs/swagger';
import { Account } from 'src/account/account.entity';
import { BusinessHour } from 'src/business-hour/business-hour.entity';
import { Category } from 'src/category/category.entity';
import { DayOfWeek } from 'src/enum/days-of-week.enum';
import { Reservation } from 'src/reservation/reservation.entity';
import { StoreTable } from 'src/store-table/store-table.entity';
import {
  Entity,
  BaseEntity,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Store extends BaseEntity {
  @PrimaryColumn()
  @OneToOne(() => Account, (account) => account.id, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'id' })
  @ApiProperty()
  public id: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  @ApiProperty()
  public masterName: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  @ApiProperty()
  public storeName: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  @ApiProperty()
  public businessName: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  @ApiProperty()
  public storeType: string;

  @Column({ type: 'varchar', length: 120, nullable: false })
  @ApiProperty()
  public address: string;

  @Column({ type: 'decimal', precision: 18, scale: 10 })
  @ApiProperty()
  public latitude: number;

  @Column({ type: 'decimal', precision: 18, scale: 10 })
  @ApiProperty()
  public longitude: number;

  @Column({ type: 'varchar', length: 15, nullable: true })
  @ApiProperty()
  public storePhone: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  @ApiProperty()
  public masterPhone: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  public introduce: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  @ApiProperty()
  public storeImage: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  @ApiProperty()
  public businessNumber: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  @ApiProperty()
  public mainMenu1: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  @ApiProperty()
  public mainMenu2: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  @ApiProperty()
  public mainMenu3: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  @ApiProperty()
  public mainMenuImage: string;

  @Column({ type: 'decimal', precision: 1, scale: 1, nullable: false })
  @ApiProperty()
  public starRate: number;

  @Column({ type: 'enum', enum: DayOfWeek, nullable: true })
  @ApiProperty()
  public offDays: DayOfWeek[];

  @OneToMany(() => BusinessHour, (businessHour) => businessHour.store)
  public businessHours: BusinessHour[];

  @OneToMany(() => StoreTable, (storeTable) => storeTable.store)
  public storeTables: StoreTable[];

  @OneToMany(() => Reservation, (reservation) => reservation.store)
  public reservations: Reservation[];

  @ManyToMany(() => Category, { createForeignKeyConstraints: false })
  @JoinTable({ name: 'store_category' })
  categories: Category[];
}
