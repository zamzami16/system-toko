import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { TestModule } from './test.module';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { Tokens } from '../src/model/token.model';

describe('Auth Controller', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  afterEach(async () => {
    await testService.terminatePrisma();
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await testService.deleteUserTest();
      await testService.createUserTest();
    });

    it('should can login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'test',
          password: 'test',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should can not login', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'salah',
          password: 'salah',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/refersh', () => {
    let token: Tokens;

    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
    });

    it('should can refersh token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/refresh')
        .set('Authorization', `Bearer ${token.refreshToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject if refresh token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/refresh')
        .set('Authorization', `Bearer ${token.refreshToken}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    let token: Tokens;

    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
    });

    it('should can logout', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.accessToken).toBe('');
      expect(response.body.data.refreshToken).toBe('');
    });

    it('should can reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token.accessToken}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });
  });
});
