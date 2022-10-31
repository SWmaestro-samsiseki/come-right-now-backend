import { faker } from '@faker-js/faker';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { CryptUtilService } from 'src/crypt-util/crypt-util.service';
import { UserType } from 'src/enum/user-type.enum';
import { UserService } from 'src/user/user.service';
import { anything, instance, mock, reset, verify, when } from 'ts-mockito';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { AccountService } from './account.service';
import { LoginInputDTO } from './dto/account.dto';
import { SignupDTO } from './dto/sign-up.dto';

describe('AccountService', () => {
  let accountService: AccountService;

  const accountRepository: Repository<Account> = mock<Repository<Account>>();
  const jwtService: JwtService = mock<JwtService>();
  const cryptUtilService: CryptUtilService = mock<CryptUtilService>();
  const userService: UserService = mock<UserService>();

  beforeEach(async () => {
    const iAccountRepository = instance(accountRepository);
    const iJwtService = instance(jwtService);
    const iCryptUtilService = instance(cryptUtilService);
    const iUserService = instance(userService);

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AccountService,
          useFactory: () =>
            new AccountService(iAccountRepository, iJwtService, iCryptUtilService, iUserService),
        },
      ],
    }).compile();

    accountService = app.get(AccountService);
  });

  afterEach(async () => {
    reset(accountRepository);
    reset(jwtService);
    reset(cryptUtilService);
    reset(userService);
  });

  describe('login', () => {
    it('return LoginOutputDTO', async () => {
      const account = new Account();
      const id = faker.datatype.uuid();
      const email = faker.internet.exampleEmail();
      const password = 'test';
      account.id = id;
      account.email = email;
      account.password = password;
      account.userType = UserType.USER;
      const loginInputDto: LoginInputDTO = {
        email,
        password,
      };
      const token = 'token';

      when(accountRepository.findOne(anything())).thenResolve(account);
      when(cryptUtilService.isHashValid(anything(), anything())).thenResolve(true);
      when(jwtService.sign(anything(), anything())).thenReturn(token);

      const result = await accountService.login(loginInputDto);

      expect(result.isSuccess).toBe(true);
      expect(result.message).toBe('로그인에 성공했습니다.');
      expect(result.token).toBe(token);
      expect(result.userType).toBe(UserType.USER);
    });

    it('throw Unauthorization Exception if password is not valid', async () => {
      const account = new Account();
      const id = faker.datatype.uuid();
      const email = faker.internet.exampleEmail();
      const password = 'test';
      account.id = id;
      account.email = email;
      account.password = password;
      account.userType = UserType.USER;
      const loginInputDto: LoginInputDTO = {
        email,
        password,
      };
      const token = 'token';

      when(accountRepository.findOne(anything())).thenResolve(account);
      when(cryptUtilService.isHashValid(anything(), anything())).thenResolve(false);
      when(jwtService.sign(anything(), anything())).thenReturn(token);

      try {
        await accountService.login(loginInputDto);
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('createAccount', () => {
    it('return CreateAccountDTO', async () => {
      const email = faker.internet.exampleEmail();
      const password = 'test';
      const name = 'test';
      const phone = '010-1234-5678';
      const birthDate = '000222';
      const id = faker.datatype.uuid();
      const account = new Account();
      account.id = id;
      account.email = email;
      account.password = password;
      account.userType = UserType.USER;
      const token = 'token';
      const signupDTO: SignupDTO = {
        email,
        password,
        name,
        phone,
        birthDate,
      };

      when(cryptUtilService.hash(anything())).thenResolve(password);
      when(accountRepository.create(anything())).thenReturn(account as any);
      when(accountRepository.save(anything())).thenResolve(account);
      when(jwtService.sign(anything(), anything())).thenReturn(token);
      when(userService.createUser(anything())).thenResolve();

      const result = await accountService.createAccount(signupDTO);

      expect(result.token).toBe(token);
      verify(userService.createUser(anything())).once();
    });
  });
});
