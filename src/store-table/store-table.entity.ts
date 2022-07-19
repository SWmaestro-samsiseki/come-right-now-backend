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
export class StoreTable extends BaseEntity {
  @PrimaryGeneratedColumn(/*'increment'*/)
  public storeTableId: number;

  @Column({ type: 'int', nullable: false })
  public tableNumber: number;

  @Column({ type: 'tinyint', nullable: false })
  public isReserved: number;

  @ManyToOne(() => Store, (store) => store.storeTables)
  store: Store;
}
