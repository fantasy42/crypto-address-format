import type {ValidationContext} from '../createValidator';
import type {ValidationResult} from '../../types';

import {describe, it, expect, vi} from 'vite-plus/test';

import {createValidator} from '../createValidator';
import {ValidationErrorCodes} from '../../constants';

describe('createValidator factory', () => {
  const validAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';

  it('passes a valid string through to the inner validator', () => {
    const result = alwaysSuccessValidator(validAddress);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.type).toBe('test');
      expect(result.original).toBe(validAddress);
    }
  });

  it('trims whitespace before calling inner validator', () => {
    const spy = vi.fn((addr: string, ctx: ValidationContext) =>
      ctx.success({type: 'test', address: addr, original: addr})
    );
    const validator = createValidator(spy);
    validator('   ' + validAddress + '   ');
    expect(spy).toHaveBeenCalledWith(validAddress, expect.any(Object));
  });

  it('delegates null/undefined to prevalidate (returns NULL_OR_UNDEFINED)', () => {
    const result = alwaysSuccessValidator(null as any);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.code).toBe(ValidationErrorCodes.NULL_OR_UNDEFINED);
      expect(result.original).toBe('');
    }
  });

  it('delegates empty/whitespace to prevalidate (returns EMPTY)', () => {
    const result = alwaysSuccessValidator('   ');
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.code).toBe(ValidationErrorCodes.EMPTY);
      expect(result.original).toBe('');
    }
  });

  it('delegates too‑long to prevalidate (returns TOO_LONG)', () => {
    const result = alwaysSuccessValidator('0x' + 'a'.repeat(257));
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.code).toBe(ValidationErrorCodes.TOO_LONG);
    }
  });

  it('delegates invalid characters to prevalidate (returns INVALID_CHARACTERS)', () => {
    const result = alwaysSuccessValidator('0x1234\x00abcd');
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.code).toBe(ValidationErrorCodes.INVALID_CHARACTERS);
    }
  });

  it('catches exceptions from inner validator and returns INTERNAL_ERROR', () => {
    const result = throwingValidator('anything');
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.code).toBe(ValidationErrorCodes.INTERNAL_ERROR);
      expect(result.message).toMatch(/Internal Error: boom/);
      expect(result.original).toBe('anything');
    }
  });

  it('never throws for any input, even after inner exception', () => {
    expect(() => throwingValidator('will-not-throw-outside')).not.toThrow();
  });

  it('validation context success builds correct result shape', () => {
    const validator = createValidator((addr, ctx) =>
      ctx.success({type: 'mock', address: addr, original: addr})
    );
    const res = validator('0x123');
    expect(res.isValid).toBe(true);
    if (res.isValid) {
      expect(res.type).toBe('mock');
      expect(res.address).toBe('0x123');
    }
  });

  it('validation context failure builds correct result shape', () => {
    const validator = createValidator((addr, ctx) =>
      ctx.failure({
        code: ValidationErrorCodes.INVALID_CHECKSUM,
        message: 'bad',
        original: addr,
      })
    );
    const res = validator('0xabc');
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      expect(res.code).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
      expect(res.message).toBe('bad');
    }
  });
});

const alwaysSuccessValidator = createValidator(
  (address: string, {success}: ValidationContext) => {
    return success({type: 'test', address, original: address});
  }
);

const throwingValidator = createValidator<ValidationResult<any>>(
  (_addr: string, _ctx: ValidationContext): ValidationResult<any> => {
    throw new Error('boom');
  }
);
