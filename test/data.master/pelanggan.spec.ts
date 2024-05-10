import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TestModule } from '../test.module';
import { Logger } from 'winston';
import { TestService } from '../test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { Contact, JenisPajak, JenisPelanggan, Pelanggan } from '@prisma/client';

describe('Barang Controller', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;
  let token: { access_token: string };
  const namaJenisPelanggan = 'jenis pelanggan pelanggan test';

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

  describe('POST /api/pelanggans', () => {
    let jenisPelanggan: JenisPelanggan;
    let contact: Contact;

    beforeEach(async () => {
      await testService.deletePelangganTest(namaJenisPelanggan);
      await testService.deleteContactTest(namaJenisPelanggan);
      await testService.deleteJenisPelangganTest(namaJenisPelanggan);
      jenisPelanggan =
        await testService.createJenisPelangganTest(namaJenisPelanggan);
      contact =
        await testService.createContactComplementTest(namaJenisPelanggan);
    });

    it('should be able to create pelanggan', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/pelanggans')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          contactId: contact.id,
          jenisPelangganId: jenisPelanggan.id,
          isCanCredit: true,
          saldoPiutang: 0,
          maxPiutang: 2_000_000,
          limitHariPiutang: 30,
          jatuhTempo: 60,
          jenisPajak: JenisPajak.Inclusive,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.contact.nama).toBe(namaJenisPelanggan);
    });

    it('should be able to create pelanggan with default value', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/pelanggans')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          contactId: contact.id,
          jenisPelangganId: jenisPelanggan.id,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.contact.nama).toBe(namaJenisPelanggan);
      expect(response.body.data.jenisPajak).toBe(JenisPajak.None);
      expect(response.body.data.jatuhTempo).toBe(0);
      expect(response.body.data.limitHariPiutang).toBe(0);
      expect(response.body.data.maxPiutang).toBe(0);
      expect(response.body.data.saldoPiutang).toBe(0);
      expect(response.body.data.isCanCredit).toBeFalsy();
    });

    it('should be able to create pelanggan with new contact', async () => {
      await testService.deleteContactTest(namaJenisPelanggan);
      const response = await request(app.getHttpServer())
        .post('/api/pelanggans')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          contact: {
            nama: namaJenisPelanggan,
          },
          jenisPelangganId: jenisPelanggan.id,
          isCanCredit: true,
          saldoPiutang: 0,
          maxPiutang: 2_000_000,
          limitHariPiutang: 30,
          jatuhTempo: 60,
          jenisPajak: JenisPajak.Inclusive,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.contact.nama).toBe(namaJenisPelanggan);
    });

    it('should be rejected if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/pelanggans')
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          contactId: contact.id,
          jenisPelangganId: jenisPelanggan.id,
          isCanCredit: true,
          saldoPiutang: 0,
          maxPiutang: 2_000_000,
          limitHariPiutang: 30,
          jatuhTempo: 60,
          jenisPajak: JenisPajak.Inclusive,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should be rejected if data contact invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/pelanggans')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          jenisPelangganId: jenisPelanggan.id,
          isCanCredit: true,
          saldoPiutang: 0,
          maxPiutang: 2_000_000,
          limitHariPiutang: 30,
          jatuhTempo: 60,
          jenisPajak: JenisPajak.Inclusive,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should be rejected if data contact does not exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/pelanggans')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          contactId: contact.id + 1,
          jenisPelangganId: jenisPelanggan.id,
          isCanCredit: true,
          saldoPiutang: 0,
          maxPiutang: 2_000_000,
          limitHariPiutang: 30,
          jatuhTempo: 60,
          jenisPajak: JenisPajak.Inclusive,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should be rejected if data jenis pelanggan does not exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/pelanggans')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          contactId: contact.id,
          jenisPelangganId: jenisPelanggan.id + 1,
          isCanCredit: true,
          saldoPiutang: 0,
          maxPiutang: 2_000_000,
          limitHariPiutang: 30,
          jatuhTempo: 60,
          jenisPajak: JenisPajak.Inclusive,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should be rejected if data jenis pajak invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/pelanggans')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          contactId: contact.id,
          jenisPelangganId: jenisPelanggan.id,
          isCanCredit: true,
          saldoPiutang: 0,
          maxPiutang: 2_000_000,
          limitHariPiutang: 30,
          jatuhTempo: 60,
          jenisPajak: JenisPajak.Inclusive + 'salah',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });
  });

  describe('GET /api/pelanggans/:contactId', () => {
    let pelanggan: Pelanggan;

    beforeEach(async () => {
      pelanggan = await testService.recreatePelanggan(namaJenisPelanggan);
    });

    it('should be able to get pelanggan', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans/${pelanggan.contactId}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.contact.nama).toBe(namaJenisPelanggan);
    });

    it('should be reject if pelanggan not exists', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans/${pelanggan.contactId + 1}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should be reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans/${pelanggan.contactId}`)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });
  });

  describe('DELETE /api/pelanggans/:contactId', () => {
    let pelanggan: Pelanggan;

    beforeEach(async () => {
      pelanggan = await testService.recreatePelanggan(namaJenisPelanggan);
    });

    it('should be able to delete pelanggan', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/pelanggans/${pelanggan.contactId}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.contact.nama).toBe(namaJenisPelanggan);
      expect(
        await testService.isPelangganExists(pelanggan.contactId),
      ).toBeFalsy();
    });

    it('should be reject if pelanggan not exists', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans/${pelanggan.contactId + 1}`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
      expect(
        await testService.isPelangganExists(pelanggan.contactId),
      ).toBeTruthy();
    });

    it('should be reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans/${pelanggan.contactId}`)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
      expect(
        await testService.isPelangganExists(pelanggan.contactId),
      ).toBeTruthy();
    });
  });

  describe('PUT /api/pelanggans/:contactId', () => {
    let pelanggan: Pelanggan;

    beforeEach(async () => {
      pelanggan = await testService.recreatePelanggan(namaJenisPelanggan);
    });

    it('should be able to update pelanggan', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/pelanggans/${pelanggan.contactId}`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          isCanCredit: true,
          saldoPiutang: 2_000_000,
          maxPiutang: 5_000_000,
          limitHariPiutang: 20,
          jatuhTempo: 60,
          jenisPajak: JenisPajak.Inclusive,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.isCanCredit).toBe(true);
      expect(response.body.data.saldoPiutang).toBe(2_000_000);
      expect(response.body.data.maxPiutang).toBe(5_000_000);
      expect(response.body.data.limitHariPiutang).toBe(20);
      expect(response.body.data.jatuhTempo).toBe(60);
      expect(response.body.data.jenisPajak).toBe(JenisPajak.Inclusive);
    });

    it('should reject if jenis pelanggan not exists', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/pelanggans/${pelanggan.contactId}`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          jenisPelangganId: pelanggan.jenisPelangganId + 1,
          isCanCredit: true,
          saldoPiutang: 2_000_000,
          maxPiutang: 5_000_000,
          limitHariPiutang: 20,
          jatuhTempo: 60,
          jenisPajak: JenisPajak.Inclusive,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject if jenis pajak invalid', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/pelanggans/${pelanggan.contactId}`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          jenisPelangganId: pelanggan.jenisPelangganId + 1,
          isCanCredit: true,
          saldoPiutang: 2_000_000,
          maxPiutang: 5_000_000,
          limitHariPiutang: 20,
          jatuhTempo: 60,
          jenisPajak: JenisPajak.Inclusive + 'salah',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/pelanggans/${pelanggan.contactId}`)
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          jenisPelangganId: pelanggan.jenisPelangganId,
          isCanCredit: true,
          saldoPiutang: 2_000_000,
          maxPiutang: 5_000_000,
          limitHariPiutang: 20,
          jatuhTempo: 60,
          jenisPajak: JenisPajak.Inclusive,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });
  });

  describe('GET /api/pelanggans', () => {
    beforeEach(async () => {
      await testService.recreatePelanggan(namaJenisPelanggan);
    });

    it('should be able to get pelanggans', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.data.length).toBe(10);
    });

    it('should be able to get pelanggans on page 2', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          page: 2,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(1);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(2);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(2);
    });

    it('should be able to get pelanggans on page 2 and size 3', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
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
      expect(response.body.paging.page).toBe(2);
      expect(response.body.paging.size).toBe(3);
      expect(response.body.paging.total_page).toBeGreaterThan(3);
    });

    it('should be able to get pelanggans with filter nama', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
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
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should be able to get pelanggans with filter nama gaada', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          nama: 'gaada',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(0);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(0);
    });

    it('should be able to get pelanggans with filter isCanCredit false', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          isCanCredit: false,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(5);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should be able to get pelanggans with filter isCanCredit true', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          isCanCredit: true,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(6);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(1);
    });

    it('should be able to get pelanggans with filter jenisPajak Non', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          jenisPajak: JenisPajak.None,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(0);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(0);
    });

    it('should be able to get pelanggans with filter jenisPajak Exclusive', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          jenisPajak: JenisPajak.Exclusive,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(0);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(0);
    });

    it('should be able to get pelanggans with filter jenisPajak Inclusive', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          jenisPajak: JenisPajak.Inclusive,
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(10);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(2);
    });

    it('should be able to get pelanggans with filter jenisPelanggan gaada', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          jenisPelanggan: 'gaada',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(0);
      expect(response.body.paging).toBeDefined();
      expect(response.body.paging.page).toBe(1);
      expect(response.body.paging.size).toBe(10);
      expect(response.body.paging.total_page).toBe(0);
    });

    it('should be rejected if token invalid', async () => {
      await testService.recreatePelangganMultiTest();
      const response = await request(app.getHttpServer())
        .get(`/api/pelanggans`)
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .query({
          jenisPelanggan: 'gaada',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });
});
