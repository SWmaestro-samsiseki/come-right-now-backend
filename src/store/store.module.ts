import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/category/category.entity';
import { StoreController } from './store.controller';
import { Store } from './store.entity';
import { StoreService } from './store.service';

@Module({
  imports: [TypeOrmModule.forFeature([Store, Category])],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
