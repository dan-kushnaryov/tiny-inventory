import { describe, expect, it } from 'vitest';
import { envValidationSchema } from './env.validation';

const valid = {
  PORT: 3000,
  DB_HOST: 'localhost',
  DB_PORT: 5432,
  DB_USER: 'u',
  DB_PASSWORD: 'p',
  DB_NAME: 'db',
  DB_SYNC: 'true',
};

describe('envValidationSchema', () => {
  it('accepts a minimal valid payload', () => {
    const result = envValidationSchema.validate(valid);
    expect(result.error).toBeUndefined();
    expect(result.value as typeof valid).toMatchObject(valid);
  });

  it('rejects invalid PORT', () => {
    const { error } = envValidationSchema.validate({ ...valid, PORT: 0 });
    expect(error).toBeDefined();
  });

  it('rejects empty DB_HOST', () => {
    const { error } = envValidationSchema.validate({ ...valid, DB_HOST: '' });
    expect(error).toBeDefined();
  });

  it('rejects DB_SYNC not true/false string', () => {
    const { error } = envValidationSchema.validate({
      ...valid,
      DB_SYNC: 'yes',
    });
    expect(error).toBeDefined();
  });
});
