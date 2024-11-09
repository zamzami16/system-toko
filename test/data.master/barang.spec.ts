import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { Logger } from 'winston';
import { TestService } from '../test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { JenisBarang } from '@prisma/client';
import { UpdateBarangRequest } from '../../src/model/data.master/barang.model';

describe('Barang Controller', () => {
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

    await testService.recreatePropertiBarang();
  });

  afterEach(async () => {
    await testService.terminatePrisma();
  });

  describe('POST /api/barang', () => {
    beforeEach(async () => {
      await testService.deleteBarangTest();
    });

    it('should be able to create barang', async () => {
      const barang = await testService.createBarang();
      logger.info({ barang: barang });
      const response = await request(app.getHttpServer())
        .post('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(barang);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe('test');
      expect(response.body.data.jenisBarang).toBe(JenisBarang.Barang);
      expect(response.body.data.detailGudangs).toBeTruthy();
    });

    it('should reject if supplier invalid', async () => {
      const barang = await testService.createBarang();
      barang.supplierContactId = 0;
      logger.info({ barang: barang });
      const response = await request(app.getHttpServer())
        .post('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(barang);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if supplier not exists', async () => {
      const barang = await testService.createBarang();
      const lastSupplierContactId = await testService.getLastSupplierId();
      barang.supplierContactId = lastSupplierContactId + 1;
      logger.info({ barang: barang });
      const response = await request(app.getHttpServer())
        .post('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(barang);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if satuan not exists', async () => {
      const barang = await testService.createBarang();
      const lastSatuanId = await testService.getLastSatuanId();
      barang.satuanId = lastSatuanId + 1;
      barang.detailSatuans[0].satuanId = barang.satuanId;

      logger.info({ barang: barang });
      const response = await request(app.getHttpServer())
        .post('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(barang);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
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
  });

  describe('PUT /api/barang/:barang_id', () => {
    let barang: UpdateBarangRequest;

    beforeEach(async () => {
      await testService.deleteBarangTest();
      await testService.createBarangTest();
      barang = await testService.getBarangTest();
    });

    it('should be able to update barang', async () => {
      barang.nama = barang.nama + ' Updated';
      logger.info({ barang: barang });
      const response = await request(app.getHttpServer())
        .put('/api/barang/' + barang.id)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(barang);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.nama).toBe('test' + ' Updated');
      expect(response.body.data.jenisBarang).toBe(JenisBarang.Barang);
    });

    it('should reject if token wrong', async () => {
      barang.nama = barang.nama + ' Updated';
      const response = await request(app.getHttpServer())
        .put('/api/kategori/' + barang.id)
        .set('Authorization', `Bearer ${token.accessToken}salah`)
        .send(barang);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if barang does not exists', async () => {
      barang.nama = barang.nama + ' Updated';
      barang.detailSatuans.forEach((b) => (b.barangId = b.barangId + 1));
      logger.info({ barang: barang });
      const response = await request(app.getHttpServer())
        .put('/api/barang/' + (barang.id + 1))
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(barang);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if barang supplier does not exists', async () => {
      barang.nama = barang.nama + ' Updated';
      const lastSupplierContactId = await testService.getLastSupplierId();

      barang.supplierContactId = lastSupplierContactId + 1;
      logger.info({ barang: barang });
      const response = await request(app.getHttpServer())
        .put('/api/barang/' + barang.id)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(barang);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/barang/:barang_id', () => {
    beforeEach(async () => {
      await testService.deleteBarangTest();
      await testService.createBarangTest();
    });

    it('should be able to DELETE barang', async () => {
      const barang = await testService.getBarangTest();
      logger.info({ barang: barang });
      const response = await request(app.getHttpServer())
        .delete('/api/barang/' + barang.id)
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const isBarangExists = await testService.isBarangExists(barang.id);
      expect(isBarangExists).toBe(false);
    });

    it('should reject if token wrong', async () => {
      const barang = await testService.getBarangTest();
      const response = await request(app.getHttpServer())
        .delete('/api/kategori/' + barang.id)
        .set('Authorization', `Bearer ${token.accessToken}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if barang does not exists', async () => {
      const barang = await testService.getBarangTest();
      logger.info({ barang: barang });
      const response = await request(app.getHttpServer())
        .delete('/api/barang/' + (barang.id + 1))
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/barang/:barang_id', () => {
    beforeEach(async () => {
      await testService.deleteBarangTest();
      await testService.createBarangTest();
    });

    it('should be able to get detail barang', async () => {
      const barang = await testService.getBarangTest();
      logger.info({ barang: barang });
      const response = await request(app.getHttpServer())
        .get('/api/barang/' + barang.id)
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(barang.id);
      expect(response.body.data.nama).toBe(barang.nama);
      expect(response.body.data.satuanId).toBe(barang.satuanId);
    });

    it('should reject if token wrong', async () => {
      const barang = await testService.getBarangTest();
      const response = await request(app.getHttpServer())
        .delete('/api/kategori/' + barang.id)
        .set('Authorization', `Bearer ${token.accessToken}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if barang does not exists', async () => {
      const barang = await testService.getBarangTest();
      logger.info({ barang: barang });
      const response = await request(app.getHttpServer())
        .delete('/api/barang/' + (barang.id + 1))
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/barang', () => {
    beforeEach(async () => {
      await testService.deleteBarangTest();
      await testService.createBarangTest();
      await testService.createBarangMultiTest(10);
    });

    it('should be able to search barang with default query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.totalPage).toBeGreaterThan(0);
    });

    it('should be able to search barang with page parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          page: 2,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(2);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.totalPage).toBeGreaterThan(0);
    });

    it('should be able to search barang with page out of page', async () => {
      const totalBarang = await testService.getTotalBarang();
      const size = 5;
      const totalPage = Math.ceil(totalBarang / size);
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          page: totalPage + 1,
          size: size,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(0);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(totalPage + 1);
      expect(response.body.paging.size).toBe(size);
      expect(response.body.paging.totalPage).toBe(totalPage);
    });

    it('should be able to search barang with parameter nama not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          nama: 'GA ada',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(0);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
    });

    it('should be able to search barang with nama paramater', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          nama: 'Multi',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(10);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.totalPage).toBeGreaterThan(0);
    });

    it('should be able to search barang with satuan paramater', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          satuan: 'test',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(1);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
    });

    it('should be able to search barang with satuan paramater not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          satuan: 'Gaada',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(0);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
    });

    it('should be able to search barang with kategori paramater', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          kategori: 'tes',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(1);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
    });

    it('should be able to search barang with kategori paramater not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          kategori: 'Gaada',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(0);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
    });

    it('should be able to search barang with supplierContactId paramater not found', async () => {
      const lastSupplierContactId = await testService.getLastSupplierId();

      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          supplierContactId: lastSupplierContactId + 1,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(0);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
    });

    it('should be able to search barang with supplier paramater', async () => {
      const barang = await testService.getBarangTest();
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          supplierContactId: barang.supplierContactId,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(1);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
    });

    it('should be able to search barang with subkategori paramater', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          subkategori: 'tes',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(1);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
    });

    it('should be able to search barang with subkategori paramater not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          subkategori: 'Gaada',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(0);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
    });

    it('should be able to search barang with all query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          subkategori: 'test',
          kategori: 'test',
          test: 'test',
          nama: 'multi',
          page: 1,
          size: 20,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(20);
    });

    it('should be able to search barang with id and all query', async () => {
      const barang = await testService.getBarangTest();
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          barang_id: barang.id,
          subkategori: 'test',
          kategori: 'test',
          test: 'test',
          nama: 'test',
          page: 1,
          size: 20,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].id).toBe(barang.id);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(20);
    });

    it('should be reject if token wrong', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/barang')
        .set('Authorization', `Bearer ${token.accessToken}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });
});
