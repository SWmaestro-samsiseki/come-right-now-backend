import { Module } from '@nestjs/common';
import { StoreTableController } from './store-table.controller';
import { StoreTableService } from './store-table.service';

@Module({
  controllers: [StoreTableController],
  providers: [StoreTableService]
})
export class StoreTableModule {}
