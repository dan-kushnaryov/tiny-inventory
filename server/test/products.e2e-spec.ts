import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  createE2eApplication,
  truncateStoresAndProducts,
} from './helpers/bootstrap-app';
import { http, readUuid } from './helpers/http-e2e';
import { seedCategory } from './helpers/seed-category';
import {
  expectSnapshotBody,
  sanitizeForSnapshot,
} from './helpers/snapshot-sanitize';

let app: INestApplication;

beforeAll(async () => {
  app = await createE2eApplication();
}, 60_000);

afterAll(async () => {
  await app.close();
});

describe('Products API (e2e)', () => {
  beforeEach(async () => {
    await truncateStoresAndProducts(app);
  });

  async function cat(name: string): Promise<string> {
    return seedCategory(app, name);
  }

  async function createStoreId(name = 'Product Host'): Promise<string> {
    const res = await http(app).post('/stores').send({ name }).expect(201);
    return readUuid(res.body);
  }

  it('POST /products returns 404 when store does not exist', async () => {
    const categoryId = await cat('X');
    const res = await http(app)
      .post('/products')
      .send({
        name: 'Orphan',
        categoryId,
        price: 1,
        quantityInStock: 1,
        storeId: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
      })
      .expect(404);
    expectSnapshotBody(res.body);
  });

  it('POST /products creates product', async () => {
    const storeId = await createStoreId();
    const categoryId = await cat('Dairy');
    const res = await http(app)
      .post('/products')
      .send({
        name: 'Milk',
        categoryId,
        price: 3.49,
        quantityInStock: 12,
        storeId,
      })
      .expect(201);
    expectSnapshotBody(res.body);
  });

  it('POST /products rejects invalid payload', async () => {
    const storeId = await createStoreId();
    const categoryId = await cat('X');
    const res = await http(app)
      .post('/products')
      .send({
        name: 'Bad',
        categoryId,
        price: -1,
        quantityInStock: 1,
        storeId,
      })
      .expect(400);
    expectSnapshotBody(res.body);
  });

  it('GET /products lists with pagination meta', async () => {
    const storeId = await createStoreId();
    const categoryId = await cat('C1');
    await http(app)
      .post('/products')
      .send({
        name: 'P1',
        categoryId,
        price: 1,
        quantityInStock: 1,
        storeId,
      })
      .expect(201);
    const res = await http(app).get('/products?page=1&limit=10').expect(200);
    expectSnapshotBody(res.body);
  });

  it('GET /products filters by storeId and categoryId', async () => {
    const storeId = await createStoreId();
    const produceId = await cat('Produce');
    const apple = await http(app)
      .post('/products')
      .send({
        name: 'Apple',
        categoryId: produceId,
        price: 2,
        quantityInStock: 5,
        storeId,
      })
      .expect(201);
    const produceCategoryId = readUuid(apple.body, 'categoryId');
    const hardwareId = await cat('Hardware');
    await http(app)
      .post('/products')
      .send({
        name: 'Bolt',
        categoryId: hardwareId,
        price: 0.5,
        quantityInStock: 100,
        storeId,
      })
      .expect(201);
    const res = await http(app)
      .get(
        `/products?storeId=${encodeURIComponent(storeId)}&categoryId=${encodeURIComponent(produceCategoryId)}`,
      )
      .expect(200);
    expectSnapshotBody(res.body);
  });

  it('GET /products filters by price and stock range', async () => {
    const storeId = await createStoreId();
    const gId = await cat('G');
    await http(app)
      .post('/products')
      .send({
        name: 'Cheap',
        categoryId: gId,
        price: 1,
        quantityInStock: 1,
        storeId,
      })
      .expect(201);
    await http(app)
      .post('/products')
      .send({
        name: 'Premium',
        categoryId: gId,
        price: 99.99,
        quantityInStock: 50,
        storeId,
      })
      .expect(201);
    const res = await http(app)
      .get(
        `/products?storeId=${encodeURIComponent(storeId)}&minPrice=0&maxPrice=10&minStock=0&maxStock=10`,
      )
      .expect(200);
    expectSnapshotBody(res.body);
  });

  it('GET /products rejects invalid price range', async () => {
    const res = await http(app)
      .get('/products?minPrice=10&maxPrice=1')
      .expect(400);
    expectSnapshotBody(res.body);
  });

  it('GET /products rejects invalid include', async () => {
    const res = await http(app).get('/products?include=unknown').expect(400);
    expectSnapshotBody(res.body);
  });

  it('GET /products include=store embeds store', async () => {
    const storeId = await createStoreId('Embed Store');
    const zId = await cat('Z');
    await http(app)
      .post('/products')
      .send({
        name: 'With Store',
        categoryId: zId,
        price: 2,
        quantityInStock: 3,
        storeId,
      })
      .expect(201);
    const res = await http(app).get('/products?include=store').expect(200);
    expectSnapshotBody(res.body);
  });

  it('GET /products/:id returns 404', async () => {
    const res = await http(app)
      .get('/products/cccccccc-cccc-4ccc-cccc-cccccccccccc')
      .expect(404);
    expectSnapshotBody(res.body);
  });

  it('GET /products/:id with include=store', async () => {
    const storeId = await createStoreId('Detail Store');
    const zId = await cat('Z');
    const created = await http(app)
      .post('/products')
      .send({
        name: 'Detail',
        categoryId: zId,
        price: 4,
        quantityInStock: 7,
        storeId,
      })
      .expect(201);
    const productId = readUuid(created.body);
    const res = await http(app)
      .get(`/products/${productId}?include=store`)
      .expect(200);
    expectSnapshotBody(res.body);
  });

  it('PATCH /products/:id updates product', async () => {
    const storeId = await createStoreId();
    const catId = await cat('Cat');
    const created = await http(app)
      .post('/products')
      .send({
        name: 'Before',
        categoryId: catId,
        price: 10,
        quantityInStock: 1,
        storeId,
      })
      .expect(201);
    const productId = readUuid(created.body);
    const res = await http(app)
      .patch(`/products/${productId}`)
      .send({ name: 'After', price: 12.5, quantityInStock: 2 })
      .expect(200);
    expectSnapshotBody(res.body);
  });

  it('DELETE /products/:id returns 204 then GET 404', async () => {
    const storeId = await createStoreId();
    const zId = await cat('Z');
    const created = await http(app)
      .post('/products')
      .send({
        name: 'Gone',
        categoryId: zId,
        price: 1,
        quantityInStock: 1,
        storeId,
      })
      .expect(201);
    const productId = readUuid(created.body);
    await http(app).delete(`/products/${productId}`).expect(204);
    const res = await http(app).get(`/products/${productId}`);
    expect(res.status).toBe(404);
    expectSnapshotBody(res.body);
  });

  it('sanitizer replaces UUIDs inside error messages', () => {
    const body = {
      message: 'Store with id "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee" not found',
    };
    expect(sanitizeForSnapshot(body)).toMatchSnapshot();
  });
});
