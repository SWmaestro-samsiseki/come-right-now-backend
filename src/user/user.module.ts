import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreModule } from 'src/store/store.module';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';

@Module({
  imports: [StoreModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserGateway],
})
export class UserModule {}
