import { Module } from '@nestjs/common';
import { StoreModule } from 'src/store/store.module';
import { UserController } from './user.controller';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';

@Module({
  imports: [StoreModule],
  controllers: [UserController],
  providers: [UserService, UserGateway],
})
export class UserModule {}
