import type { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import request from 'supertest';

export function http(app: INestApplication) {
  return request(app.getHttpServer() as Server);
}

export function readUuid(body: unknown, key = 'id'): string {
  if (body == null || typeof body !== 'object') {
    throw new TypeError('Expected JSON object body');
  }
  const v = (body as Record<string, unknown>)[key];
  if (typeof v !== 'string') {
    throw new TypeError(`Expected string at "${key}"`);
  }
  return v;
}
