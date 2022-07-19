import { BusinessHour } from 'src/business-hour/business-hour.entity';
import { Category } from 'src/category/category.entity';
import { DayOfWeek } from 'src/enum/days-of-week.enum';
import { Reservation } from 'src/reservation/reservation.entity';
import { StoreTable } from 'src/store-table/store-table.entity';
import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Store extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  public email: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  public password: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  public masterName: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  public storeName: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  public businessName: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  public storeType: string;

  @Column({ type: 'varchar', length: 120, nullable: false })
  public address: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  public latitude: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  public longitude: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  public storePhone: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  public masterPhone: string;

  @Column({ type: 'text', nullable: true })
  public introduce: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  public storeImage: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  public businessNumber: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  public mainMenu1: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  public mainMenu2: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  public mainMenu3: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  public mainMenuImage: string;

  @Column({ type: 'enum', enum: DayOfWeek, nullable: false })
  public offDays: DayOfWeek[];

  @OneToMany(() => BusinessHour, (businessHour) => businessHour.store)
  public businessHours: BusinessHour[];

  @OneToMany(() => StoreTable, (storeTable) => storeTable.store)
  public storeTables: StoreTable[];

  @OneToMany(() => Reservation, (reservation) => reservation.store)
  public reservations: Reservation[];

  @ManyToMany(() => Category, { createForeignKeyConstraints: false })
  @JoinTable({ name: 'store_category' })
  storeCategories: Category[];
}
