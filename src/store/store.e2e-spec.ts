import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';

describe('Store', () => {
  let app: INestApplication;
  let token = '';
  const storeId = 's1',
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
        email: 'school@naver.com',
        password: 'q1w2e3r4',
      })
      .end((err: any, res: any) => {
        token = res.body.token;
        done();
      });
  });

  describe('GET /store', () => {
    it('should return details of store ', async () => {
      return request(app.getHttpServer())
        .get('/store/my-info')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('GET /store/:id', () => {
    it('should return details of store ', async () => {
      return request(app.getHttpServer())
        .get(`/store/${storeId}/info`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('should return distance from store ', async () => {
      return request(app.getHttpServer())
        .get(`/store/${storeId}/distance`)
        .set('Accept', 'application/json')
        .query({ latitude, longitude })
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
