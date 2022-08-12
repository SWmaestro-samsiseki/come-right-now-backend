import { Module } from '@nestjs/common';
import { WebsocketLogger } from './logger.service';

@Module({
  providers: [WebsocketLogger],
  exports: [WebsocketLogger],
})
export class LoggerModule {}
