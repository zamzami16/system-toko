import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { Logger } from 'winston';
import { TestService } from '../test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { Gudang } from '@prisma/client';

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

    await testService.recreatePropertiBarang();
  });

  afterEach(async () => {
    await testService.terminatePrisma();
  });

  describe('POST /api/gudangs', () => {
    beforeEach(async () => {
      await testService.deleteGudangTest();
    });

    it('should be able to create gudang', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/gudangs')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'gudang test',
          alamat: 'jl. in aja dulu',
          keterangan: 'gudang untuk test',
          is_active: true,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe('gudang test');
    });

    it('should be able to create gudang with nama only', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/gudangs')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'gudang test',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe('gudang test');
    });

    it('should be able to create gudang with nama alamat', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/gudangs')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'gudang test',
          alamat: 'jl. in aja dulu',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe('gudang test');
    });

    it('should be able to create gudang with nama and keterangan', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/gudangs')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'gudang test',
          keterangan: 'gudang untuk test',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe('gudang test');
    });

    it('should reject if nama invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/gudangs')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: '',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/gudangs')
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          nama: '',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if gudang already exist', async () => {
      await testService.createGudangTest();
      const response = await request(app.getHttpServer())
        .post('/api/gudangs')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'gudang test',
          alamat: 'jl. in aja dulu',
          keterangan: 'gudang untuk test',
          is_active: true,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/gudangs/:gudang_id', () => {
    let gudang: Gudang;

    beforeEach(async () => {
      await testService.deleteGudangTest();
      gudang = await testService.createGudangTest();
    });

    it('should be able to get gudang', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gudangs/${gudang.id}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe('gudang test');
    });

    it('should reject if gudang not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gudangs/${gudang.id + 1}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gudangs/${gudang.id}`)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/gudangs/:gudang_id', () => {
    let gudang: Gudang;

    beforeEach(async () => {
      await testService.deleteGudangTest();
      gudang = await testService.createGudangTest();
    });

    it('should be able to delete gudang', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/gudangs/${gudang.id}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe('gudang test');

      const deletedGudang = await testService.getGudangTest(gudang.id);
      expect(deletedGudang).toBeFalsy();
    });

    it('should reject if gudang not found', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/gudangs/${gudang.id + 1}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/gudangs/${gudang.id}`)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/gudangs/:gudang_id', () => {
    let gudang: Gudang;

    beforeEach(async () => {
      await testService.deleteGudangTest();
      gudang = await testService.createGudangTest();
    });

    it('should be able to update gudang', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/gudangs/${gudang.id}`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: gudang.nama + ' updated',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe(gudang.nama + ' updated');
    });

    it('should reject if gudang not found', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/gudangs/${gudang.id + 1}`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: gudang.nama + ' updated',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if nama invalid', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/gudangs/${gudang.id}`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: '',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/gudangs/${gudang.id}`)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/gudangs', () => {
    beforeEach(async () => {
      await testService.deleteGudangTest();
      await testService.deleteGudangMultiTest();
      await testService.createGudangTest();
    });

    it('should be able to search gudang with default filter', async () => {
      await testService.createGudangMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/gudangs`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(10);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBeGreaterThan(1);
    });

    it('should be able to search gudang nama filter', async () => {
      await testService.createGudangMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/gudangs`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          nama: 'multi',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(10);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should be able to search gudang alamat filter', async () => {
      await testService.createGudangMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/gudangs`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          alamat: 'multi',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(10);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should be able to search gudang keterangan filter', async () => {
      await testService.createGudangMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/gudangs`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          keterangan: 'multi',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(10);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should be able to search gudang is_active = true filter', async () => {
      await testService.createGudangMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/gudangs`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          is_active: true,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(10);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(2);
    });

    it('should be able to search gudang is_active = false filter', async () => {
      await testService.createGudangMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/gudangs`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          is_active: false,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(0);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(0);
    });
  });
});
