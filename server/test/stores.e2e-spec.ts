import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  createE2eApplication,
  truncateStoresAndProducts,
} from './helpers/bootstrap-app';
import { http, readUuid } from './helpers/http-e2e';
import { seedCategory } from './helpers/seed-category';
import { expectSnapshotBody } from './helpers/snapshot-sanitize';

let app: INestApplication;

type CategoryRow = {
  id: string;
  name: string;
};

function readCategoryIdByName(body: unknown, name: string): string {
  if (!Array.isArray(body)) {
    throw new TypeError('Expected categories response to be an array');
  }
  const rows = body as CategoryRow[];
  const row = rows.find((c) => c.name === name);
  if (!row?.id) {
    throw new TypeError(`Category "${name}" not found`);
  }
  return row.id;
}

beforeAll(async () => {
  app = await createE2eApplication();
}, 60_000);

afterAll(async () => {
  await app.close();
});

describe('Stores API (e2e)', () => {
  beforeEach(async () => {
    await truncateStoresAndProducts(app);
    await seedCategory(app, 'Electronics');
    await seedCategory(app, 'Food');
  });

  it('POST /stores creates a store', async () => {
    const res = await http(app)
      .post('/stores')
      .send({ name: 'North Warehouse', address: '1 Test Lane' })
      .expect(201);
    expectSnapshotBody(res.body);
  });

  it('POST /stores rejects invalid body', async () => {
    const res = await http(app).post('/stores').send({ name: '' }).expect(400);
    expectSnapshotBody(res.body);
  });

  it('POST /stores rejects unknown properties', async () => {
    const res = await http(app)
      .post('/stores')
      .send({ name: 'Ok', extraField: 1 })
      .expect(400);
    expectSnapshotBody(res.body);
  });

  it('GET /stores returns empty paginated list', async () => {
    const res = await http(app).get('/stores').expect(200);
    expectSnapshotBody(res.body);
  });

  it('GET /stores supports pagination', async () => {
    await http(app).post('/stores').send({ name: 'Store A' }).expect(201);
    await http(app).post('/stores').send({ name: 'Store B' }).expect(201);
    const res = await http(app).get('/stores?page=1&limit=1').expect(200);
    expectSnapshotBody(res.body);
  });

  it('GET /stores/:id returns 404 for unknown id', async () => {
    const res = await http(app)
      .get('/stores/aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee')
      .expect(404);
    expectSnapshotBody(res.body);
  });

  it('GET /stores/:id rejects non-uuid param', async () => {
    const res = await http(app).get('/stores/not-a-uuid');
    expect(res.status).toBe(400);
    expectSnapshotBody(res.body);
  });

  it('GET /stores/:id/stats for empty store', async () => {
    const create = await http(app)
      .post('/stores')
      .send({ name: 'Empty Store' })
      .expect(201);
    const id = readUuid(create.body);
    const res = await http(app).get(`/stores/${id}/stats`).expect(200);
    expectSnapshotBody(res.body);
  });

  it('GET /stores/:id/stats with products and categories', async () => {
    const create = await http(app)
      .post('/stores')
      .send({ name: 'Stocked Store' })
      .expect(201);
    const storeId = readUuid(create.body);
    const categoriesRes = await http(app).get('/categories').expect(200);
    const categories: unknown = categoriesRes.body;
    const electronicsId = readCategoryIdByName(categories, 'Electronics');
    const foodId = readCategoryIdByName(categories, 'Food');
    await http(app)
      .post('/products')
      .send({
        name: 'Low item',
        categoryId: electronicsId,
        price: 10,
        quantityInStock: 2,
        storeId,
      })
      .expect(201);
    await http(app)
      .post('/products')
      .send({
        name: 'Ok item',
        categoryId: foodId,
        price: 5.5,
        quantityInStock: 10,
        storeId,
      })
      .expect(201);
    const res = await http(app).get(`/stores/${storeId}/stats`).expect(200);
    expectSnapshotBody(res.body);
  });

  it('PATCH /stores/:id updates fields', async () => {
    const create = await http(app)
      .post('/stores')
      .send({ name: 'Old Name' })
      .expect(201);
    const id = readUuid(create.body);
    const res = await http(app)
      .patch(`/stores/${id}`)
      .send({ name: 'New Name', address: null })
      .expect(200);
    expectSnapshotBody(res.body);
  });

  it('PATCH /stores/:id no-op when body empty', async () => {
    const create = await http(app)
      .post('/stores')
      .send({ name: 'Stable' })
      .expect(201);
    const id = readUuid(create.body);
    const res = await http(app).patch(`/stores/${id}`).send({}).expect(200);
    expectSnapshotBody(res.body);
  });

  it('DELETE /stores/:id returns 204 then GET 404', async () => {
    const create = await http(app)
      .post('/stores')
      .send({ name: 'To Remove' })
      .expect(201);
    const id = readUuid(create.body);
    await http(app).delete(`/stores/${id}`).expect(204);
    const res = await http(app).get(`/stores/${id}`);
    expect(res.status).toBe(404);
    expectSnapshotBody(res.body);
  });
});
