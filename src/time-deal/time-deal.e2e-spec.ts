import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';

describe('TimeDeal', () => {
  let app: INestApplication;
  let token = '',
    storeId = 's1',
    longitude = 127.3827622,
    latitude = 36.4301764;

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
        email: 'admin@gmail.com',
        password: 'q1w2e3r4',
      })
      .end((err: any, res: any) => {
        token = res.body.token;
        done();
      });
  });

  describe('GET /time-deal/store', () => {
    it('should return time deals of store', async () => {
      return request(app.getHttpServer())
        .get('/time-deal/store')
        .set('Accept', 'application/json')
        .query({ storeId })
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  // TODO: 주변 타임딜 없을 때 404 수정
  describe('GET /time-deal/store', () => {
    it('should return time deals near user', async () => {
      return request(app.getHttpServer())
        .get('/time-deal/user')
        .set('Accept', 'application/json')
        .query({ latitude, longitude })
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('should return time deals of user', async () => {
      return request(app.getHttpServer())
        .get('/time-deal/userDeals')
        .set('Accept', 'application/json')
        .query({ latitude, longitude })
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
