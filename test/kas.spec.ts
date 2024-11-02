import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { TestModule } from './test.module';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { TypeKas } from '../src/model/akun.model';
import { Kas } from '@prisma/client';
import { UpdateKasDto } from '../src/model/kas.model';

describe('Kas Controller', () => {
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

  describe('POST /api/kas', () => {
    beforeEach(async () => {
      await testService.deleteKasTest();
    });

    it('should be able to create kas', async () => {
      const kasData = {
        nama: 'kas test',
        typeKas: TypeKas.Kas,
        saldoKas: 3_000_000,
      };
      const response = await request(app.getHttpServer())
        .post('/api/kas')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(kasData);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const createdKas = response.body.data;
      expect(createdKas.nama).toBe(kasData.nama);

      // Verify that Akun entries are created
      const isAkunExists = await testService.isAkunExists(createdKas.kodeAkun);
      expect(isAkunExists).toBeTruthy();
    });

    it('should be able to create kas', async () => {
      const kasData = {
        nama: 'kas test',
        typeKas: TypeKas.Kas,
      };
      const response = await request(app.getHttpServer())
        .post('/api/kas')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(kasData);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const createdKas = response.body.data;
      expect(createdKas.nama).toBe(kasData.nama);

      // Verify that Akun entries are created
      const isAkunExists = await testService.isAkunExists(createdKas.kodeAkun);
      expect(isAkunExists).toBeTruthy();
    });

    it('should reject create kas if token invalid', async () => {
      const kasData = {
        nama: 'kas test',
        typeKas: TypeKas.Kas,
        saldoKas: 3_000_000,
      };
      const response = await request(app.getHttpServer())
        .post('/api/kas')
        .set('Authorization', `Bearer ${token.accessToken}invalid`)
        .send(kasData);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject if type kas invalid', async () => {
      const kasData = {
        nama: 'jagoo',
        typeKas: 'TypeKas.Kas',
        saldoKas: 3_000_000,
      };
      const response = await request(app.getHttpServer())
        .post('/api/kas')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(kasData);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });
  });

  describe('PUT /api/kas/kas_id', () => {
    let kas: Kas;
    let updateKasRequest: UpdateKasDto;

    beforeEach(async () => {
      await testService.deleteKasTest();
      kas = await testService.createKasTest();
      updateKasRequest = {
        id: kas.id,
        kodeAkunKartuKredit: kas.kodeAkunKartuKredit,
        nama: kas.nama + ' updated',
        nomorRekening: kas.nomorRekening,
        pemilik: kas.pemilik,
        saldoKas: kas.saldoKas.toNumber(),
        keterangan: kas.keterangan,
        isActive: kas.isActive,
      };
    });

    it('should be able to update kas', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/kas/' + kas.id)
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(updateKasRequest);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const updatedKas = response.body.data;
      expect(updatedKas.nama).toBe(updateKasRequest.nama);

      // Verify that Akun entries are created
      const isAkunExists = await testService.isAkunExists(updatedKas.kodeAkun);
      expect(isAkunExists).toBeTruthy();
    });

    it('should reject update kas if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/kas/` + kas.id)
        .set('Authorization', `Bearer ${token.accessToken}invalid`)
        .send(updateKasRequest);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject update kas if kas not found', async () => {
      updateKasRequest.id++;
      const response = await request(app.getHttpServer())
        .put(`/api/kas/` + (kas.id + 1))
        .set('Authorization', `Bearer ${token.accessToken}`)
        .send(updateKasRequest);
      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });
  });

  describe('GET /api/kas/:kas_id', () => {
    let kas: Kas;
    beforeEach(async () => {
      await testService.deleteKasTest();
      kas = await testService.createKasTest();
    });

    it('should be able to find kas by id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/kas/' + kas.id)
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const result = response.body.data;
      expect(result.nama).toBe(kas.nama);
    });

    it('should reject get kas if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/kas/` + kas.id)
        .set('Authorization', `Bearer ${token.accessToken}invalid`);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject get kas if kas not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/kas/` + (kas.id + 1))
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });
  });

  describe('GET /api/kas', () => {
    beforeEach(async () => {
      await testService.deleteKasTest();
      await testService.createKasTest();
    });

    it('should be able to find kas', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/kas')
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const result = response.body.data;
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be able to find kas by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/kas')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          name: 'gaada',
        });

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const result = response.body.data;
      expect(result.length).toBe(0);
    });

    it('should be able to find kas by status aktif', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/kas')
        .set('Authorization', `Bearer ${token.accessToken}`)
        .query({
          isActive: false,
        });

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const result = response.body.data;
      expect(result.length).toBe(0);
    });
  });

  describe('DELETE /api/kas/:kas_id', () => {
    let kas: Kas;
    beforeEach(async () => {
      await testService.deleteKasTest();
      kas = await testService.createKasTest();
    });

    it('should be able to delete kas', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/kas/' + kas.id)
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const result = response.body.data;
      expect(result.nama).toBe(kas.nama);

      const isAkunExists = await testService.isAkunExists(result.kodeAkun);
      expect(isAkunExists).toBeFalsy();

      if (result.kodeAkunKartuKredit) {
        const isAkunExists = await testService.isAkunExists(result.kodeAkun);
        expect(isAkunExists).toBeFalsy();
      }
    });

    it('should reject delete kas if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/kas/` + kas.id)
        .set('Authorization', `Bearer ${token.accessToken}invalid`);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(401);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });

    it('should reject get kas if kas not found', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/kas/` + (kas.id + 1))
        .set('Authorization', `Bearer ${token.accessToken}`);

      logger.info(JSON.stringify(response.body));

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
      expect(response.body.data).toBeUndefined();
    });
  });
});
