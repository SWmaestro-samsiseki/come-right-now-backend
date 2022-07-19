import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn(/*'increment'*/)
  public id: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  public name: string;
}
