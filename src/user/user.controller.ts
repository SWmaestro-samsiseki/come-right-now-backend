import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { getAccount } from 'src/account/get-account.decorator';
import { UserInfoDTO } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/my-info')
  @UseGuards(AuthGuard())
  getUserInfo(@getAccount() account): Promise<UserInfoDTO> {
    const { id } = account;
    return this.userService.getUserInfo(id);
  }
}
