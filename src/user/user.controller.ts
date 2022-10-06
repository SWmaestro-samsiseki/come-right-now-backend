import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Account } from 'src/account/account.entity';
import { getAccount } from 'src/account/get-account.decorator';
import { UserInfoDTO } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Token',
  })
  @ApiOkResponse({
    description: 'UserInfoDTO',
    type: UserInfoDTO,
  })
  @Get('/my-info')
  @UseGuards(AuthGuard())
  async getUserInfo(@getAccount() account: Account): Promise<UserInfoDTO> {
    const { id } = account;
    return await this.userService.getUserInfo(id);
  }
}
