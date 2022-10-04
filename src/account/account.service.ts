import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginInputDTO, LoginOutputDTO } from './dto/account.dto';
import { Account } from './account.entity';
import { JwtService } from '@nestjs/jwt';
import { UserType } from 'src/enum/user-type.enum';

type JWTPayload = {
  uuid: string;
  email: string;
  userType: UserType;
};

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private jwtService: JwtService,
  ) {}

  async login(loginInputDto: LoginInputDTO): Promise<LoginOutputDTO> {
    const { email, password } = loginInputDto;
    const account = await this.accountRepository.findOne({ where: { email } });
    // FIXME: 암호화
    if (account && password === account.password) {
      const payload: JWTPayload = { uuid: account.id, email, userType: account.userType };
      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_KEY,
      });
      return {
        isSuccess: true,
        message: '로그인에 성공했습니다.',
        accessToken,
        userType: account.userType,
      };
    } else {
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  }

  getPayload(token: string): JWTPayload {
    const decoded: JWTPayload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET_KEY,
    });

    return decoded;
  }
}
