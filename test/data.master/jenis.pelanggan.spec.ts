import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { Logger } from 'winston';
import { TestService } from '../test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { JenisPelanggan } from '@prisma/client';

describe('Barang Controller', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;
  let token: { access_token: string };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
    token = await testService.createUserAndLoginTest();
  });

  afterEach(async () => {
    await testService.terminatePrisma();
  });

  describe('POST /api/jenis_pelanggans', () => {
    beforeEach(async () => {
      await testService.deleteJenisPelangganTest();
    });

    it('should be able to create jenis pelanggan', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/jenis_pelanggans')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'jenis pelanggan test',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe('jenis pelanggan test');
    });

    it('should reject if data invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/jenis_pelanggans')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: '',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/jenis_pelanggans')
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          nama: 'jenis pelanggan test',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject if data already exists', async () => {
      await testService.createJenisPelangganTest();
      const response = await request(app.getHttpServer())
        .post('/api/jenis_pelanggans')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'jenis pelanggan test',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });
  });

  describe('GET /api/jenis_pelanggans/:jenisPelangganId', () => {
    let jenisPelanggan: JenisPelanggan;

    beforeEach(async () => {
      await testService.deleteJenisPelangganTest();
      jenisPelanggan = await testService.createJenisPelangganTest();
    });

    it('should be able to get jenis pelanggan', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/jenis_pelanggans/${jenisPelanggan.id}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe(jenisPelanggan.nama);
      expect(response.body.data.id).toBe(jenisPelanggan.id);
      expect(response.body.data.isDefault).toBe(jenisPelanggan.isDefault);
    });

    it('should reject if data not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/jenis_pelanggans/${jenisPelanggan.id + 1}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/jenis_pelanggans/${jenisPelanggan.id}`)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });
  });

  describe('DELETE /api/jenis_pelanggans/:jenisPelangganId', () => {
    let jenisPelanggan: JenisPelanggan;

    beforeEach(async () => {
      await testService.deleteJenisPelangganTest();
      jenisPelanggan = await testService.createJenisPelangganTest();
    });

    it('should be able to delete jenis pelanggan', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/jenis_pelanggans/${jenisPelanggan.id}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe(jenisPelanggan.nama);
      expect(response.body.data.id).toBe(jenisPelanggan.id);
      expect(response.body.data.isDefault).toBe(jenisPelanggan.isDefault);
    });

    it('should reject if data not found', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/jenis_pelanggans/${jenisPelanggan.id + 1}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/jenis_pelanggans/${jenisPelanggan.id}`)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });
  });

  describe('PUT /api/jenis_pelanggans/:jenisPelangganId', () => {
    let jenisPelanggan: JenisPelanggan;

    beforeEach(async () => {
      await testService.deleteJenisPelangganTest();
      jenisPelanggan = await testService.createJenisPelangganTest();
    });

    it('should be able to update jenis pelanggan', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/jenis_pelanggans/${jenisPelanggan.id}`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: jenisPelanggan.nama + ' updated',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe(jenisPelanggan.nama + ' updated');
      expect(response.body.data.id).toBe(jenisPelanggan.id);
      expect(response.body.data.isDefault).toBe(jenisPelanggan.isDefault);
    });

    it('should be able to update jenis pelanggan with status default true', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/jenis_pelanggans/${jenisPelanggan.id}`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: jenisPelanggan.nama + ' updated',
          isDefault: true,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe(jenisPelanggan.nama + ' updated');
      expect(response.body.data.id).toBe(jenisPelanggan.id);
      expect(response.body.data.isDefault).toBeTruthy();
    });

    it('should reject if update default jenis pelanggan to false', async () => {
      await testService.deleteJenisPelangganTest();
      const defaultJenisPelanggan =
        await testService.createJenisPelangganDefaultTest();

      const response = await request(app.getHttpServer())
        .put(`/api/jenis_pelanggans/${defaultJenisPelanggan.id}`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: jenisPelanggan.nama + ' updated',
          isDefault: false,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject if data not found', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/jenis_pelanggans/${jenisPelanggan.id + 1}`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: jenisPelanggan.nama + ' updated',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/jenis_pelanggans/${jenisPelanggan.id}`)
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          nama: jenisPelanggan.nama + ' updated',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });
  });

  describe('GET /api/jenis_pelanggans', () => {
    beforeEach(async () => {
      await testService.deleteJenisPelangganTest();
      await testService.deleteJenisPelangganMultiTest();
      await testService.createJenisPelangganTest();
    });

    it('should be able to search jenis pelanggan with default filter', async () => {
      await testService.createJenisPelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/jenis_pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(10);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.page).toBe(1);
    });

    it('should be able to search jenis pelanggan with filter nama multi', async () => {
      await testService.createJenisPelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/jenis_pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          nama: 'multi',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(10);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.page).toBe(1);
    });

    it('should be able to search jenis pelanggan with filter default multi', async () => {
      await testService.createJenisPelangganMultiTest();
      await testService.deleteJenisPelangganTest();
      await testService.createJenisPelangganDefaultTest();
      const response = await request(app.getHttpServer())
        .get(`/api/jenis_pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          isDefault: true,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(1);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should be able to search jenis pelanggan with pagination page 2', async () => {
      await testService.createJenisPelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/jenis_pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          page: 2,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.page).toBe(2);
      expect(response.body.paging.total_page).toBe(2);
    });

    it('should be able to search jenis pelanggan with pagination page 2 size 3', async () => {
      await testService.createJenisPelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/jenis_pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          page: 2,
          size: 3,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(3);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(3);
      expect(response.body.paging.page).toBe(2);
      expect(response.body.paging.total_page).toBeGreaterThan(2);
    });

    it('should be able to search jenis pelanggan with all filters', async () => {
      await testService.createJenisPelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/jenis_pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          nama: 'multi',
          isDefault: false,
          page: 2,
          size: 3,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(3);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(3);
      expect(response.body.paging.page).toBe(2);
      expect(response.body.paging.total_page).toBeGreaterThan(2);
    });
  });
});
