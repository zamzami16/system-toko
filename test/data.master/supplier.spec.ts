import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { Logger } from 'winston';
import { TestService } from '../test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { Supplier } from '@prisma/client';

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

  describe('POST /api/suppliers', () => {
    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteSupplierTest();
    });

    it('should can create new supplier', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          contact: {
            nama: 'supplier test',
          },
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
    });

    it('should can create new supplier from existing contact', async () => {
      const contact = await testService.createContactSupplierTest();
      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          contactId: contact.id,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
    });

    it('should reject if contact not exists', async () => {
      const contact = await testService.createContactSupplierTest();
      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          contactId: contact.id + 1,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if supplier already exists', async () => {
      const contact = await testService.createContactSupplierTest();
      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          contact: {
            nama: contact.nama,
          },
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}salah`)
        .send({
          contact: {
            nama: 'supplier test',
          },
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/suppliers/:contactId', () => {
    let supplier: Supplier;
    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteSupplierTest();
      supplier = await testService.createSupplierTest();
    });

    it('should can delete supplier', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/suppliers/' + supplier.contactId)
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
    });

    it('should reject if supplier does not exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers/' + (supplier.contactId + 1))
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers/' + supplier.contactId)
        .set('Authorization', `Bearer ${token.accessToken}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/suppliers/:contactId', () => {
    let supplier: Supplier;
    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteSupplierTest();
      supplier = await testService.createSupplierTest();
    });

    it('should can update supplier', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/suppliers/' + supplier.contactId)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          contactId: supplier.contactId,
          saldoHutang: 2_000_000,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.saldoHutang).toBe(2_000_000);
    });

    it('should reject if supplier does not exists', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/suppliers/' + (supplier.contactId + 1))
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send({
          contactId: supplier.contactId,
          saldoHutang: 2_000_000,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers/' + supplier.contactId)
        .set('Authorization', `Bearer ${token.accessToken}salah`)
        .send({
          contactId: supplier.contactId,
          saldoHutang: 2_000_000,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/suppliers', () => {
    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteSupplierTest();
      await testService.deleteSupplierMultiTest();
      await testService.createSupplierTest();
    });

    it('should can search suppliers with default query', async () => {
      await testService.createSupplierMultiTest();
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(10);
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should can search supplier with nama query', async () => {
      await testService.createSupplierMultiTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          nama: 'multi',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(10);
    });

    it('should can search supplier with nama query not exists', async () => {
      await testService.createSupplierMultiTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          nama: 'tidak ada',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(0);
    });

    it('should can search supplier with noHp query', async () => {
      await testService.createSupplierMultiTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          noHp: '89723662',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(10);
    });

    it('should can search supplier with alamat query', async () => {
      await testService.createSupplierMultiTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          alamat: 'Alamat',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(10);
    });

    it('should can search supplier with email query', async () => {
      await testService.createSupplierMultiTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          email: '@test.com',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(10);
    });

    it('should can search suppplier with all query on page 2', async () => {
      await testService.createSupplierMultiTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          nama: 'multi',
          email: '@test.com',
          alamat: 'Alamat',
          noHp: '89723662',
          size: 5,
          page: 2,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(5);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.totalPage).toBe(2);
    });
  });
});
