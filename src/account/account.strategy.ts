import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Account } from './account.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(Account) private accountRepository: Repository<Account>) {
    super({
      secretOrKey: 'Soma123',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload) {
    const { uuid } = payload;
    const account: Account = await this.accountRepository.findOne({ where: { id: uuid } });
    console.log(account);
    if (!account) {
      throw new UnauthorizedException('로그인 정보가 존재하지 않습니다.');
    }
    return account;
  }
}
