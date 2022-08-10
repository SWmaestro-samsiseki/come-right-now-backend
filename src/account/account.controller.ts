import { Body, Controller, Get, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginInputDTO, LoginOutputDTO } from './dto/account.dto';
import { AccountService } from './account.service';
import { getAccount } from './get-account.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('/login')
  login(@Body(ValidationPipe) loginInputDto: LoginInputDTO): Promise<LoginOutputDTO> {
    return this.accountService.login(loginInputDto);
  }

  @Get('/validation')
  @UseGuards(AuthGuard())
  checkValidation(@getAccount() account) {
    return { statusCode: 200, userType: account.userType };
  }
}
