import { ApiProperty } from '@nestjs/swagger';
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn(/*'increment'*/)
  @ApiProperty()
  public id: number;

  @Column({ type: 'varchar', length: 20, nullable: false })
  @ApiProperty()
  public name: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  @ApiProperty()
  public image: string;
}
