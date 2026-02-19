import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { execSync } from 'child_process';

describe('CatalogController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/catalog/categories (GET)', () => {
    return request(app.getHttpServer())
      .get('/catalog/categories')
      .expect(200)
      .expect((res) => {
        if (!Array.isArray(res.body)) throw new Error('Body is not array');
        if (res.body.length < 1) throw new Error('Categories count too low');
      });
  });

  it('/catalog/products (GET) should return paginated products', () => {
    return request(app.getHttpServer())
      .get('/catalog/products?page=1&limit=24&category=all')
      .expect(200)
      .expect((res: any) => {
        if (!res.body.items || !Array.isArray(res.body.items))
          throw new Error('Body.items is not array');
        if (res.body.items.length < 1)
          throw new Error(`Products count too low: ${res.body.items.length}`);
        if (typeof res.body.total !== 'number')
          throw new Error('Total is missing');
        if (typeof res.body.pageCount !== 'number')
          throw new Error('pageCount is missing');
      });
  });

  it('/catalog/packs (GET)', () => {
    return request(app.getHttpServer())
      .get('/catalog/packs')
      .expect(200)
      .expect((res) => {
        if (!Array.isArray(res.body)) throw new Error('Body is not array');
        if (res.body.length < 1) throw new Error('Packs count too low');
      });
  });

  it(
    'Running seed twice should be idempotent',
    async () => {
      // First count
      const count1 = await prisma.catalogProduct.count();

      console.log('Running seed second time for idempotency check...');
      execSync('npx prisma db seed', { stdio: 'inherit' });

      // Second count
      const count2 = await prisma.catalogProduct.count();

      expect(count2).toBe(count1);
    },
    20000,
  ); // 20s timeout for seed
});
