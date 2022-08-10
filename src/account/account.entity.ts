import { ApiProperty } from '@nestjs/swagger';
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['email'])
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  public id: string;

  @Column({ type: 'varchar', length: 30, nullable: false })
  @ApiProperty()
  public email: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  @ApiProperty()
  public password: string;

  @Column({ type: 'varchar', length: 6, default: 'USER' })
  @ApiProperty()
  public userType: string;
}
