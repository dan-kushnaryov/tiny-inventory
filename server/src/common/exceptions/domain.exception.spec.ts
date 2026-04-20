import { describe, expect, it } from 'vitest';
import { DomainException } from './domain.exception';

class TestDomainError extends DomainException {
  readonly code = 'TEST_CODE' as const;

  constructor() {
    super('msg');
  }
}

describe('DomainException', () => {
  it('sets message and name from subclass', () => {
    const e = new TestDomainError();
    expect(e.message).toBe('msg');
    expect(e.name).toBe('TestDomainError');
    expect(e.code).toBe('TEST_CODE');
  });
});
