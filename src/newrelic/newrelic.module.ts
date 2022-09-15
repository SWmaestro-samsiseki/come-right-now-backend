import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { NewrelicInterceptor } from 'src/newrelic/newrelic.interceptor';
import { NewrelicWebsocketInterceptor } from 'src/newrelic/newrelic.websocket.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useExisting: NewrelicInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useExisting: NewrelicWebsocketInterceptor,
    },
    NewrelicWebsocketInterceptor,
    NewrelicInterceptor,
  ],
})
export class NewrelicModule {}
