import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginInputDto, LoginOutputDTO } from './account.dto';
import { Account } from './account.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './account.constants';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private jwtService: JwtService,
  ) {}

  async login(loginInputDto: LoginInputDto): Promise<LoginOutputDTO> {
    const { email, password } = loginInputDto;
    const account = await this.accountRepository.findOne({ where: { email } });
    // FIXME: 암호화
    //if (account && (await bcrypt.compare(password, account.password))) {
    if (account && password === account.password) {
      const payload = { uuid: account.id, email, userType: account.userType };
      const accessToken = this.jwtService.sign(payload);
      return {
        isSuccess: true,
        message: '로그인에 성공했습니다.',
        accessToken,
        userType: account.userType,
      };
    } else {
      return {
        isSuccess: false,
        message: '로그인에 실패했습니다.',
        accessToken: '',
        userType: '',
      };
    }
  }

  getPayload(token: string) {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET_KEY,
    });

    return decoded;
  }
}
