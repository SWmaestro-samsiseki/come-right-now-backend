import { Body, Controller, Get, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginInputDTO, LoginOutputDTO } from './dto/account.dto';
import { AccountService } from './account.service';
import { getAccount } from './get-account.decorator';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Account } from './account.entity';
import { ValidationDTO } from './dto/validation.dto';
import { SignupDTO } from './dto/sign-up.dto';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @ApiCreatedResponse({
    description: 'loginOutputDTO',
    type: LoginOutputDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Post('/login')
  login(@Body(ValidationPipe) loginInputDto: LoginInputDTO): Promise<LoginOutputDTO> {
    return this.accountService.login(loginInputDto);
  }

  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Token',
  })
  @ApiOkResponse({
    description: 'ValidationDTO',
    type: ValidationDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @Get('/validation')
  @UseGuards(AuthGuard())
  checkValidation(@getAccount() account: Account): ValidationDTO {
    return { statusCode: 200, userType: account.userType };
  }

  @ApiCreatedResponse({
    description: 'token',
    type: String,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @Post('/signup')
  async createAccount(@Body() signupDTO: SignupDTO) {
    return await this.accountService.createAccount(signupDTO);
  }
}
