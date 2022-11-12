import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';

describe('Category', () => {
  let app: INestApplication;
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
        email: 'admin@gmail.com',
        password: 'q1w2e3r4',
      })
      .end((err: any, res: any) => {
        token = res.body.token;
        done();
      });
  });

  describe('GET /category', () => {
    it('should return categories', async () => {
      return request(app.getHttpServer())
        .get('/category')
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
