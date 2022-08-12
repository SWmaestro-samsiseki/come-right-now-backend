import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class WebsocketLogger extends ConsoleLogger {
  websocketEventLog(eventName: string, emitOrListen: boolean, isSuccess: boolean) {
    const eOrL = emitOrListen ? 'EMIT' : 'ON';
    this.log(`\x1b[34m WS EVENT ${eOrL} ${eventName} ${isSuccess}`);
  }

  websocketConnectionLog(isConnected: boolean, socketId: string, userType: 'USER' | 'STORE') {
    if (isConnected) {
      this.log(`\x1b[34m WS CONNECTED ${socketId} ${userType}`);
    } else {
      this.log(`\x1b[34m WS DISCONNECTED ${socketId} ${userType}`);
    }
  }
}
