import { Module } from '@nestjs/common';
import { BusinessOffController } from './business-off.controller';
import { BusinessOffService } from './business-off.service';

@Module({
  controllers: [BusinessOffController],
  providers: [BusinessOffService]
})
export class BusinessOffModule {}
