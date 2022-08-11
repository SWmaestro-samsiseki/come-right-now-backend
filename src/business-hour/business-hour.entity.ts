import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from 'src/enum/days-of-week.enum';
import { Store } from 'src/store/store.entity';
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class BusinessHour extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  public id: number;

  @Column({ type: 'enum', enum: DayOfWeek, nullable: false })
  @ApiProperty()
  public businessDay: DayOfWeek;

  @Column({ type: 'time', nullable: false })
  @ApiProperty()
  public openAt: Date;

  @Column({ type: 'time', nullable: false })
  @ApiProperty()
  public closeAt: Date;

  @ManyToOne(() => Store, (store) => store.businessHours, {
    createForeignKeyConstraints: false,
  })
  store: Store;
}
