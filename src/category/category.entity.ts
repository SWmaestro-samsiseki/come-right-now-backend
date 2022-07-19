import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn(/*'increment'*/)
  public categoryId: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  public categoryName: string;

  public deletedAt: Date;
}
