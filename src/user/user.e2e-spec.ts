import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';

describe('User', () => {
  let app: INestApplication;
  // TODO: 로그인해서 토큰 값 가져오기
  let token = '';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  beforeAll((done) => {
    request(app.getHttpServer())
      .post('/account/login')
      .send({
        email: 'admin@naver.com',
        password: 'q1w2e3r4',
      })
      .end((err: any, res: any) => {
        token = res.body.accessToken; // 받은 응답을 위에서 선언한 token에 담아준다
        done();
      });
  });

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      return request(app.getHttpServer())
        .get('/user/my-info')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
