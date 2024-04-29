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

  describe('POST /api/suppliers', () => {
    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteSupplierTest();
    });

    it('should can create new supplier', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${token.access_token}`)
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
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          contact_id: contact.id,
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
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          contact_id: contact.id + 1,
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
        .set('Authorization', `Bearer ${token.access_token}`)
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
        .set('Authorization', `Bearer ${token.access_token}salah`)
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

  describe('DELETE /api/suppliers/:contact_id', () => {
    let supplier: Supplier;
    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteSupplierTest();
      supplier = await testService.createSupplierTest();
    });

    it('should can delete supplier', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/suppliers/' + supplier.contact_id)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
    });

    it('should reject if supplier does not exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers/' + (supplier.contact_id + 1))
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers/' + supplier.contact_id)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/suppliers/:contact_id', () => {
    let supplier: Supplier;
    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteSupplierTest();
      supplier = await testService.createSupplierTest();
    });

    it('should can update supplier', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/suppliers/' + supplier.contact_id)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          contact_id: supplier.contact_id,
          saldo_hutang: 2_000_000,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.saldo_hutang).toBe(2_000_000);
    });

    it('should reject if supplier does not exists', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/suppliers/' + (supplier.contact_id + 1))
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          contact_id: supplier.contact_id,
          saldo_hutang: 2_000_000,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers/' + supplier.contact_id)
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          contact_id: supplier.contact_id,
          saldo_hutang: 2_000_000,
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
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(10);
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should can search supplier with nama query', async () => {
      await testService.createSupplierMultiTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${token.access_token}`)
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
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          nama: 'tidak ada',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(0);
    });

    it('should can search supplier with no_hp query', async () => {
      await testService.createSupplierMultiTest(10);
      const response = await request(app.getHttpServer())
        .get('/api/suppliers')
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          no_hp: '89723662',
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
        .set('Authorization', `Bearer ${token.access_token}`)
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
        .set('Authorization', `Bearer ${token.access_token}`)
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
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          nama: 'multi',
          email: '@test.com',
          alamat: 'Alamat',
          no_hp: '89723662',
          size: 5,
          page: 2,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(5);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.total_page).toBe(2);
    });
  });
});
