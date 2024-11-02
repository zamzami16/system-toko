import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { Logger } from 'winston';
import { TestService } from '../test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { JenisBarang } from '@prisma/client';

describe('Kategori Controller', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;
  let token: { accessToken: string };

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

  describe('POST /api/kategori', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
      await testService.deleteKategoriTest();
    });

    it('should be able to create kategori', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          nama: 'test',
          jenisBarang: JenisBarang.Barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe('test');
      expect(response.body.data.jenisBarang).toBe(JenisBarang.Barang);
    });

    it('should reject if token wrong', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}salah`)
        .send({
          nama: 'test',
          jenisBarang: JenisBarang.Barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          nama: '',
          jenisBarang: JenisBarang.Barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if jenis barang invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          nama: 'test',
          jenisBarang: 'Beruang',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data already exists', async () => {
      await testService.createKategoriTest();
      const response = await request(app.getHttpServer())
        .post('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          nama: 'test',
          jenisBarang: JenisBarang.Barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/kategori/:kategoriId', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able get kategori', async () => {
      const kategori = await testService.getKategoriTest();
      const response = await request(app.getHttpServer())
        .get('/api/kategori/' + kategori.id)
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(kategori.id);
      expect(response.body.data.nama).toBe(kategori.nama);
      expect(response.body.data.jenisBarang).toBe(kategori.jenisBarang);
    });

    it('should reject if token wrong', async () => {
      const kategori = await testService.getKategoriTest();
      const response = await request(app.getHttpServer())
        .get('/api/kategori/' + kategori.id)
        .set('Authorization', `Bearer ${token.accessToken}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data does not exists', async () => {
      const kategori = await testService.getKategoriTest();
      const response = await request(app.getHttpServer())
        .get('/api/kategori/' + (kategori.id + 1))
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/kategori/:kategoriId', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able update kategori', async () => {
      const kategori = await testService.getKategoriTest();
      const response = await request(app.getHttpServer())
        .put('/api/kategori/' + kategori.id)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          nama: 'test updated',
          jenisBarang: kategori.jenisBarang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(kategori.id);
      expect(response.body.data.nama).toBe('test updated');
      expect(response.body.data.jenisBarang).toBe(kategori.jenisBarang);
    });

    it('should reject if token wrong', async () => {
      const kategori = await testService.getKategoriTest();
      const response = await request(app.getHttpServer())
        .put('/api/kategori/' + kategori.id)
        .set('Authorization', `Bearer ${token.accessToken}salah`)
        .send({
          nama: 'test updated',
          jenisBarang: kategori.jenisBarang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data invalid', async () => {
      const kategori = await testService.getKategoriTest();
      const response = await request(app.getHttpServer())
        .put('/api/kategori/' + (kategori.id + 1))
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          nama: '',
          jenisBarang: kategori.jenisBarang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/kategori', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able get kategori with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.page).toBe(1);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should be able get kategori with jenis barang exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}`)
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

    it('should be able get kategori with jenis barang does not exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}`)
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

    it('should be able get kategori with filter nama', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}`)
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

    it('should be able get kategori with pagination', async () => {
      await testService.createMultiKategoriTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}`)
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

    it('should be able get kategori with pagination page 2', async () => {
      await testService.createMultiKategoriTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}`)
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
        .get('/api/kategori')
        .set('Authorization', `Bearer ${token.accessToken}test`)
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

  describe('DELETE /api/kategori/:kategoriId', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able delete kategori', async () => {
      const kategori = await testService.getKategoriTest();
      const response = await request(app.getHttpServer())
        .delete('/api/kategori/' + kategori.id)
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(kategori.id);
      expect(response.body.data.nama).toBe(kategori.nama);
      expect(response.body.data.jenisBarang).toBe(kategori.jenisBarang);
    });

    it('should reject if token wrong', async () => {
      const kategori = await testService.getKategoriTest();
      const response = await request(app.getHttpServer())
        .delete('/api/kategori/' + kategori.id)
        .set('Authorization', `Bearer ${token.accessToken}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data does not exists', async () => {
      const kategori = await testService.getKategoriTest();
      const response = await request(app.getHttpServer())
        .get('/api/kategori/' + (kategori.id + 1))
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });
});
