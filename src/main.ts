import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // #1. 서버 환경 설정
  const port = process.env.SERVER_PORT || 80;

  // #2. 서버 생성
  initServer(port);
}

/**
 * @param {number} port 서버 바인딩 포트
 */
async function initServer(port) {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // #3. 바인딩
  await app.listen(port, () => Logger.log(`Server started on port ${process.env.SERVER_PORT}`));
}

bootstrap();
