import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginInputDTO, LoginOutputDTO } from './dto/account.dto';
import { Account } from './account.entity';
import { JwtService } from '@nestjs/jwt';
import { UserType } from 'src/enum/user-type.enum';
import { SignupDTO } from './dto/sign-up.dto';
import { CryptUtilService } from 'src/crypt-util/crypt-util.service';
import { UserService } from 'src/user/user.service';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';

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
    private readonly cryptUtilService: CryptUtilService,
    private readonly userService: UserService,
  ) {}

  async login(loginInputDto: LoginInputDTO): Promise<LoginOutputDTO> {
    const { email, password } = loginInputDto;
    const account = await this.accountRepository.findOne({ where: { email } });
    if (account.id.length <= 5) {
      if (account && password === account.password) {
        const payload: JWTPayload = { uuid: account.id, email, userType: account.userType };
        const accessToken = this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET_KEY,
        });
        return {
          isSuccess: true,
          message: '로그인에 성공했습니다.',
          token: accessToken,
          userType: account.userType,
        };
      } else {
        throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    }

    if (await this.cryptUtilService.isHashValid(password, account.password)) {
      const payload: JWTPayload = { uuid: account.id, email, userType: account.userType };
      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_KEY,
      });
      return {
        isSuccess: true,
        message: '로그인에 성공했습니다.',
        token: accessToken,
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

  async createAccount(signupDTO: SignupDTO) {
    const { email, password, name, phone, birthDate } = signupDTO;

    const account = new Account();
    account.email = email;
    account.password = await this.cryptUtilService.hash(password);
    account.userType = UserType.USER;

    const newAccount = await account.save();

    const payload: JWTPayload = { uuid: newAccount.id, email, userType: account.userType };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
    });

    const createUserDTO: CreateUserDTO = {
      name,
      phone,
      birthDate,
      id: newAccount.id,
    };
    await this.userService.createUser(createUserDTO);
    return {
      token,
    };
  }
}
