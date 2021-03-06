import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfoDTO } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async findUser(userId: string) {
    return await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
  }

  async getUserInfo(userId: string): Promise<UserInfoDTO> {
    const userInfo = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndMapOne('user.account', 'user.id', 'account')
      .select([
        'user.id',
        'user.name',
        'user.phone',
        'user.birthDate',
        'user.creditRate',
        'account.email',
      ])
      .where('user.id = :userId', { userId })
      .getOne();

    const { id, name, phone, birthDate, creditRate, account } = userInfo;
    const userInfoData: UserInfoDTO = {
      id,
      email: account.email,
      name,
      phone,
      birthDate,
      creditRate,
    };

    return userInfoData;
  }
}
