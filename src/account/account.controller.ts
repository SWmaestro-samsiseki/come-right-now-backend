import { Body, Controller, Header, Post, ValidationPipe } from '@nestjs/common';
import { LoginInputDto, LoginOutputDTO } from './account.dto';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('/login')
  login(@Body(ValidationPipe) loginInputDto: LoginInputDto): Promise<LoginOutputDTO> {
    return this.accountService.login(loginInputDto);
  }
}
