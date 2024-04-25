import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { Logger } from 'winston';
import { TestService } from '../test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { JenisBarang } from '@prisma/client';
import { Tokens } from '../../src/model/token.model';

describe('Subkategori Controller', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;
  let token: Tokens;

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

  describe('POST /api/subkategori', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
      await testService.deleteSubkategoriTest();
    });

    it('should be able to create subkategori', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/subkategori')
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
        .post('/api/subkategori')
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
        .post('/api/subkategori')
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
        .post('/api/subkategori')
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
      await testService.createSubkategoriTest();
      const response = await request(app.getHttpServer())
        .post('/api/subkategori')
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

  describe('GET /api/subkategori/:subkategori_id', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able get subkategori', async () => {
      const subkategori = await testService.getSubkategoriTest();
      const response = await request(app.getHttpServer())
        .get('/api/subkategori/' + subkategori.id)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(subkategori.id);
      expect(response.body.data.nama).toBe(subkategori.nama);
      expect(response.body.data.jenis_barang).toBe(subkategori.jenis_barang);
    });

    it('should reject if token wrong', async () => {
      const kategori = await testService.getSubkategoriTest();
      const response = await request(app.getHttpServer())
        .get('/api/subkategori/' + kategori.id)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data does not exists', async () => {
      const kategori = await testService.getSubkategoriTest();
      const response = await request(app.getHttpServer())
        .get('/api/subkategori/' + (kategori.id + 1))
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/subkategori/:subkategori_id', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able update subkategori', async () => {
      const subkategori = await testService.getSubkategoriTest();
      const response = await request(app.getHttpServer())
        .put('/api/subkategori/' + subkategori.id)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'test updated',
          jenis_barang: subkategori.jenis_barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(subkategori.id);
      expect(response.body.data.nama).toBe('test updated');
      expect(response.body.data.jenis_barang).toBe(subkategori.jenis_barang);
    });

    it('should reject if token wrong', async () => {
      const subkategori = await testService.getSubkategoriTest();
      const response = await request(app.getHttpServer())
        .put('/api/subkategori/' + subkategori.id)
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          nama: 'test updated',
          jenis_barang: subkategori.jenis_barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data invalid', async () => {
      const subkategori = await testService.getSubkategoriTest();
      const response = await request(app.getHttpServer())
        .put('/api/subkategori/' + (subkategori.id + 1))
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: '',
          jenis_barang: subkategori.jenis_barang,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/subkategori', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able get subkategori with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/subkategori')
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

    it('should be able get subkategori with jenis barang exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/subkategori')
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

    it('should be able get subkategori with jenis barang does not exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/subkategori')
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

    it('should be able get subkategori with filter nama', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/subkategori')
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

    it('should be able get subkategori with pagination', async () => {
      await testService.createMultiSubkategoriTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/subkategori')
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

    it('should be able get subkategori with pagination page 2', async () => {
      await testService.createMultiSubkategoriTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/subkategori')
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
        .get('/api/subkategori')
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

  describe('DELETE /api/subkategori/:subkategori_id', () => {
    beforeEach(async () => {
      await testService.recreatePropertiBarang();
    });

    it('should be able delete subkategori', async () => {
      const subkategori = await testService.getSubkategoriTest();
      const response = await request(app.getHttpServer())
        .delete('/api/subkategori/' + subkategori.id)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(subkategori.id);
      expect(response.body.data.nama).toBe(subkategori.nama);
      expect(response.body.data.jenis_barang).toBe(subkategori.jenis_barang);
    });

    it('should reject if token wrong', async () => {
      const subkategori = await testService.getSubkategoriTest();
      const response = await request(app.getHttpServer())
        .delete('/api/subkategori/' + subkategori.id)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data does not exists', async () => {
      const subkategori = await testService.getSubkategoriTest();
      const response = await request(app.getHttpServer())
        .get('/api/subkategori/' + (subkategori.id + 1))
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });
});
