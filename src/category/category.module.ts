import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from 'src/account/account.module';
import { CategoryController } from './category.controller';
import { Category } from './category.entity';
import { CategoryService } from './category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), AccountModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
