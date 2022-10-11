import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { UserInfoDTO } from './user/dto/user.dto';
import { WebsocketLogger } from './logger/logger.service';
import { NewrelicInterceptor } from './newrelic/newrelic.interceptor';
import { RedisIoAdapter } from './redis.adapter';
import { UserTimeDealsDTO } from './time-deal/dto/user-time-deals.dto';
import { TimeDeal } from './time-deal/time-deal.entity';
import { Participant } from './participant/participant.entity';
import { StoreForPublicDTO } from './store/dto/store-for-public.dto';
import { ReservationDTO } from './reservation/dto/reservation.dto';
import { CreateParticipantOutputDTO } from './participant/dto/create-participant.output.dto';
import { Category } from './category/category.entity';
import { LoginOutputDTO } from './account/dto/account.dto';
import { ValidationDTO } from './account/dto/validation.dto';
import { GetDistanceDTO } from './store/dto/get-distance.dto';
// import { HttpExceptionFilter } from './exception/http-exception.filter';

async function bootstrap() {
  // #1. 서버 환경 설정
  const port = parseInt(process.env.SERVER_PORT);

  // #2. 서버 생성
  initServer(port);
}

/**
 * @param {number} port 서버 바인딩 포트
 */
async function initServer(port: number) {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // app.useGlobalFilters(new HttpExceptionFilter());

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);
  app.enableCors();
  app.use(morgan('tiny'));
  app.useLogger(new WebsocketLogger());
  app.useGlobalInterceptors(new NewrelicInterceptor());

  const config = new DocumentBuilder()
    .setTitle('지금갈게 API Document')
    .setDescription('지금갈게 API, Entity, DTO 명세서')
    .setVersion('0.2')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [
      UserInfoDTO,
      UserTimeDealsDTO,
      TimeDeal,
      Participant,
      StoreForPublicDTO,
      ReservationDTO,
      CreateParticipantOutputDTO,
      Category,
      LoginOutputDTO,
      ValidationDTO,
      GetDistanceDTO,
    ],
  });

  SwaggerModule.setup('api', app, document);

  // #3. 바인딩
  await app.listen(port, () => Logger.log(`Server started on port ${process.env.SERVER_PORT}!`));
}

bootstrap();
