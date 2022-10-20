import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptUtilService {
  public async hash(text: string) {
    const salt = 10;
    return await bcrypt.hash(text, salt);
  }

  public async isHashValid(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
