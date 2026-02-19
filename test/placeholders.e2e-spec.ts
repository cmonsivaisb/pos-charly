import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Placeholders Verification (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/catalog/categories (GET) should include defaultImageKey', () => {
    return request(app.getHttpServer())
      .get('/catalog/categories')
      .expect(200)
      .expect((res) => {
        if (!Array.isArray(res.body)) throw new Error('Body is not array');
        res.body.forEach(cat => {
            if (!cat.defaultImageKey) throw new Error(`Category ${cat.slug} missing defaultImageKey`);
            if (!cat.defaultImageKey.endsWith('.svg')) throw new Error(`Category ${cat.slug} defaultImageKey should be .svg`);
        });
      });
  });

  it('/catalog/products (GET) should include category with defaultImageKey', () => {
    return request(app.getHttpServer())
      .get('/catalog/products?limit=1')
      .expect(200)
      .expect((res: any) => {
        const item = res.body.items[0];
        if (!item.category) throw new Error('Product missing category');
        if (!item.category.defaultImageKey) throw new Error('Product category missing defaultImageKey');
      });
  });
});
