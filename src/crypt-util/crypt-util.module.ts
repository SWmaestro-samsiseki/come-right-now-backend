import { Module } from '@nestjs/common';
import { CryptUtilService } from './crypt-util.service';

@Module({
  providers: [CryptUtilService],
  exports: [CryptUtilService],
})
export class CryptUtilModule {}
