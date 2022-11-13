import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';

describe('Reservation', () => {
  let app: INestApplication;
  const reservationId = 1,
    userId = 'u1',
    storeId = 's1',
    status = 'reserved',
    order = '';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  describe('GET /reservation', () => {
    it('should return user reservation details', async () => {
      return request(app.getHttpServer())
        .get(`/reservation/user/${userId}`)
        .set('Accept', 'application/json')
        .query({ status })
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('should return store reservation details', async () => {
      return request(app.getHttpServer())
        .get(`/reservation/store/${storeId}`)
        .set('Accept', 'application/json')
        .query({ status })
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('GET /reservation/:id', () => {
    it('should return details of reservation ', async () => {
      return request(app.getHttpServer())
        .get(`/reservation/${reservationId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  //   describe('DELETE /reservation/:id', () => {
  //     it('should return details of reservation ', async () => {
  //       return request(app.getHttpServer())
  //         .delete(`/reservation/${reservationId}`)
  //         .set('Accept', 'application/json')
  //         .expect(200);
  //     });
  //   });

  afterAll(async () => {
    await app.close();
  });
});
