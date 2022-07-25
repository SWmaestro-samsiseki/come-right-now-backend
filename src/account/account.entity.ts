import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['email'])
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  public email: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  public password: string;

  @Column({ type: 'varchar', length: 6, default: 'USER' })
  public userType: string;
}
