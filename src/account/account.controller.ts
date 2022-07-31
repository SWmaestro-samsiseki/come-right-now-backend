import { Body, Controller, Get, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginInputDto, LoginOutputDTO } from './account.dto';
import { AccountService } from './account.service';
import { getAccount } from './get-account.decorator';

@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('/login')
  login(@Body(ValidationPipe) loginInputDto: LoginInputDto): Promise<LoginOutputDTO> {
    return this.accountService.login(loginInputDto);
  }

  @Get('/validation')
  @UseGuards(AuthGuard())
  checkValidation(@getAccount() account) {
    return { statusCode: 200, userType: account.userType };
  }
}
