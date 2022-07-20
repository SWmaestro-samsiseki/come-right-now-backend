import { Store } from 'src/store/store.entity';
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class StoreTable extends BaseEntity {
  @PrimaryGeneratedColumn(/*'increment'*/)
  public id: number;

  @Column({ type: 'int', nullable: false })
  public tableNumber: number;

  @Column({ type: 'tinyint', nullable: false, default: 0 })
  public isReserved: number;

  @ManyToOne(() => Store, (store) => store.storeTables, {
    createForeignKeyConstraints: false,
  })
  store: Store;
}
