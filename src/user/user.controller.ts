import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { getAccount } from 'src/account/get-account.decorator';
import { UserInfoDTO } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('user')
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
