import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from './account.constants';
import { AccountController } from './account.controller';
import { Account } from './account.entity';
import { AccountService } from './account.service';
import { JwtStrategy } from './account.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: `${jwtConstants.secret}`, signOptions: { expiresIn: '1y' } }),
  ],
  controllers: [AccountController],
  providers: [AccountService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AccountModule {}
