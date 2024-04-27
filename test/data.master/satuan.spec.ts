import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { Logger } from 'winston';
import { TestService } from '../test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { JenisBarang } from '@prisma/client';

describe('Satuan Controller', () => {
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

  describe('POST /api/satuan', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
      await testService.deleteSatuanTest();
    });

    it('should be able to create satuan', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'test',
          jenis_barang: JenisBarang.Barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe('test');
      expect(response.body.data.jenis_barang).toBe(JenisBarang.Barang);
    });

    it('should reject if token wrong', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          nama: 'test',
          jenis_barang: JenisBarang.Barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: '',
          jenis_barang: JenisBarang.Barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if jenis barang invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'test',
          jenis_barang: 'Beruang',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data already exists', async () => {
      await testService.createSatuanTest();
      const response = await request(app.getHttpServer())
        .post('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'test',
          jenis_barang: JenisBarang.Barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/satuan/:satuan_id', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able get satuan', async () => {
      const satuan = await testService.getSatuanTest();
      const response = await request(app.getHttpServer())
        .get('/api/satuan/' + satuan.id)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(satuan.id);
      expect(response.body.data.nama).toBe(satuan.nama);
      expect(response.body.data.jenis_barang).toBe(satuan.jenis_barang);
    });

    it('should reject if token wrong', async () => {
      const satuan = await testService.getSatuanTest();
      const response = await request(app.getHttpServer())
        .get('/api/satuan/' + satuan.id)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data does not exists', async () => {
      const satuan = await testService.getSatuanTest();
      const response = await request(app.getHttpServer())
        .get('/api/satuan/' + (satuan.id + 1))
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/satuan/:satuan_id', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able update satuan', async () => {
      const satuan = await testService.getSatuanTest();
      const response = await request(app.getHttpServer())
        .put('/api/satuan/' + satuan.id)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'test updated',
          jenis_barang: satuan.jenis_barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(satuan.id);
      expect(response.body.data.nama).toBe('test updated');
      expect(response.body.data.jenis_barang).toBe(satuan.jenis_barang);
    });

    it('should reject if token wrong', async () => {
      const satuan = await testService.getSatuanTest();
      const response = await request(app.getHttpServer())
        .put('/api/satuan/' + satuan.id)
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          nama: 'test updated',
          jenis_barang: satuan.jenis_barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data invalid', async () => {
      const satuan = await testService.getSatuanTest();
      const response = await request(app.getHttpServer())
        .put('/api/satuan/' + (satuan.id + 1))
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: '',
          jenis_barang: satuan.jenis_barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/satuan', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able get satuan with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.page).toBe(1);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should be able get satuan with jenis barang exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          jenisbarang: JenisBarang.Barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.page).toBe(1);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should be able get satuan with jenis barang does not exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          jenisbarang: JenisBarang.Paket,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.page).toBe(1);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able get satuan with filter nama', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          nama: 'te',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.page).toBe(1);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should be able get satuan with pagination', async () => {
      await testService.createMultiSatuanTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          page: 1,
          size: 9,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(9);
      expect(response.body.paging.page).toBe(1);
      expect(response.body.data.length).toBe(9);
    });

    it('should be able get satuan with pagination page 2', async () => {
      await testService.createMultiSatuanTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          page: 2,
          size: 9,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(9);
      expect(response.body.paging.page).toBe(2);
      expect(response.body.data.length).toBeLessThan(9);
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/satuan')
        .set('Authorization', `Bearer ${token.access_token}test`)
        .query({
          page: 2,
          size: 9,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/satuan/:satuan_id', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able delete satuan', async () => {
      const satuan = await testService.getSatuanTest();
      const response = await request(app.getHttpServer())
        .delete('/api/satuan/' + satuan.id)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(satuan.id);
      expect(response.body.data.nama).toBe(satuan.nama);
      expect(response.body.data.jenis_barang).toBe(satuan.jenis_barang);
    });

    it('should reject if token wrong', async () => {
      const satuan = await testService.getSatuanTest();
      const response = await request(app.getHttpServer())
        .delete('/api/satuan/' + satuan.id)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data does not exists', async () => {
      const satuan = await testService.getSatuanTest();
      const response = await request(app.getHttpServer())
        .get('/api/satuan/' + (satuan.id + 1))
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });
});
