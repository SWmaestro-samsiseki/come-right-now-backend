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
