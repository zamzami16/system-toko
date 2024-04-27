import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { TestModule } from './test.module';
import { Logger } from 'winston';
import { TestService } from './test.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { Tokens } from '../src/model/token.model';
import { Contact } from '@prisma/client';

describe('Auth Controller', () => {
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
  });

  afterEach(async () => {
    await testService.terminatePrisma();
  });

  describe('POST /api/contacts', () => {
    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteContactTest();
    });

    it('should can create new contact', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'contact test',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
    });

    it('should can create new contact with all data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'contact test',
          alamat: 'jl. pegangsaan timur No. 56 Jakarta',
          email: 'test@test.com',
          no_hp: '081611333010',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          nama: 'contact test',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should can reject if data already exists', async () => {
      await testService.createContactTest();
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'contact test',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should can reject if nama invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: '',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should can reject if email invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: 'contact test',
          email: 'someonejhdc',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/contacts/:contact_id', () => {
    let contact: Contact;

    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteContactTest();
      contact = await testService.createContactTest();
    });

    it('should can get contact', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + contact.id)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(contact.id);
      expect(response.body.data.nama).toBe(contact.nama);
      expect(response.body.data.alamat).toBe(contact.alamat);
      expect(response.body.data.no_hp).toBe(contact.no_hp);
      expect(response.body.data.email).toBe(contact.email);
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + contact.id)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data does not exists', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts/' + (contact.id + 1))
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/contacts/:contact_id', () => {
    let contact: Contact;

    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteContactTest();
      contact = await testService.createContactTest();
    });

    it('should can updated contact', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/contacts/' + contact.id)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: contact.nama + ' updated',
          alamat: 'alamat updated',
          no_hp: '081611333010',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(contact.id);
      expect(response.body.data.nama).toBe(contact.nama + ' updated');
      expect(response.body.data.alamat).toBe('alamat updated');
      expect(response.body.data.no_hp).toBe('081611333010');
      expect(response.body.data.email).toBe(contact.email);
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/contacts/' + contact.id)
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          nama: contact.nama + ' updated',
          alamat: 'alamat updated',
          no_hp: '081611333010',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/contacts/' + contact.id)
        .set('Authorization', `Bearer ${token.access_token}salah`)
        .send({
          nama: contact.nama + ' updated',
          alamat: 'alamat updated',
          no_hp: '081611333010',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if nama already exists', async () => {
      const contactComplement =
        await testService.createContactComplementTest('sudah ada test');
      const response = await request(app.getHttpServer())
        .put('/api/contacts/' + contact.id)
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          nama: contactComplement.nama,
          alamat: 'alamat updated',
          no_hp: '081611333010',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(400);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data not exists', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/contacts/' + (contact.id + 1))
        .set('Authorization', `Bearer ${token.access_token}`)
        .send({
          alamat: 'alamat updated',
          no_hp: '081611333010',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('DELETE /api/contacts/:contact_id', () => {
    let contact: Contact;

    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteContactTest();
      contact = await testService.createContactTest();
    });

    it('should can delete contact', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/contacts/' + contact.id)
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.id).toBe(contact.id);
      expect(response.body.data.nama).toBe(contact.nama);
      expect(response.body.data.alamat).toBe(contact.alamat);
      expect(response.body.data.no_hp).toBe(contact.no_hp);
      expect(response.body.data.email).toBe(contact.email);
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/contacts/' + contact.id)
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should reject if data does not exists', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/contacts/' + (contact.id + 1))
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(404);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/contacts', () => {
    beforeEach(async () => {
      token = await testService.createUserAndLoginTest();
      await testService.deleteContactTest();
      await testService.deleteContactMultiTest();
      await testService.createContactTest();
    });

    it('should can search contact with default query', async () => {
      await testService.createContactMulti(11);
      const response = await request(app.getHttpServer())
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token.access_token}`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(10);
    });

    it('should reject if token invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token.access_token}salah`);

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(401);
      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
    });

    it('should can search contact with nama query', async () => {
      await testService.createContactMulti(10);
      const response = await request(app.getHttpServer())
        .get('/api/contacts')
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

    it('should can search contact with nama query not exists', async () => {
      await testService.createContactMulti(10);
      const response = await request(app.getHttpServer())
        .get('/api/contacts')
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

    it('should can search contact with no_hp query', async () => {
      await testService.createContactMulti(10);
      const response = await request(app.getHttpServer())
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          no_hp: '3662231',
        });

      logger.info(JSON.stringify(response.body));
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.length).toBe(10);
    });

    it('should can search contact with alamat query', async () => {
      await testService.createContactMulti(10);
      const response = await request(app.getHttpServer())
        .get('/api/contacts')
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

    it('should can search contact with email query', async () => {
      await testService.createContactMulti(10);
      const response = await request(app.getHttpServer())
        .get('/api/contacts')
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

    it('should can search contact with all query on page 2', async () => {
      await testService.createContactMulti(10);
      const response = await request(app.getHttpServer())
        .get('/api/contacts')
        .set('Authorization', `Bearer ${token.access_token}`)
        .query({
          nama: 'multi',
          email: '@test.com',
          alamat: 'Alamat',
          no_hp: '3662231',
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
