import type {ValidationContext} from '../createValidator';
import type {ValidationResult} from '../../types';

import {describe, it, expect, vi} from 'vite-plus/test';

import {createValidator} from '../createValidator';

describe('createValidator factory', () => {
  describe('base input validation (enforced by factory)', () => {
    const validAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';

    it('passes a valid string through to the inner validator', () => {
      const result = safeValidate(alwaysSuccessValidator, validAddress);
      if (result.isValid) {
        expect(result.type).toBe('test');
      } else {
        expect(result.isValid).toBe(true);
      }
    });

    it('trims whitespace before passing to inner validator', () => {
      const spy = vi.fn((addr: string, ctx: ValidationContext) =>
        ctx.success('test', addr)
      );
      const validator = createValidator(spy);
      validator('   ' + validAddress + '   ');
      expect(spy).toHaveBeenCalledWith(validAddress, expect.any(Object));
    });

    it.each([null, undefined, 123, {}, [], true])(
      'should fail on non-string input: %s',
      (input) => {
        const result = safeValidate(alwaysSuccessValidator, input);
        expect(result.isValid).toBe(false);
        assertResultShape(result);
        if (!result.isValid) {
          expect(result.error).toContain('Address must be a non-empty string');
        }
      }
    );

    it.each(['', '   ', '\t', '\n'])(
      'should fail on empty or whitespace string: %s',
      (input) => {
        const result = safeValidate(alwaysSuccessValidator, input);
        expect(result.isValid).toBe(false);
        assertResultShape(result);
        if (!result.isValid) {
          expect(result.error).toContain('empty or whitespace');
        }
      }
    );

    it.each([
      {toString: () => validAddress},
      {valueOf: () => validAddress},
      {[Symbol.toPrimitive]: () => validAddress},
    ] as any[])('should fail on objects impersonating strings', (coercer) => {
      const result = safeValidate(alwaysSuccessValidator, coercer);
      expect(result.isValid).toBe(false);
      assertResultShape(result);
    });

    it('should fail safely on extremely long strings', () => {
      const veryLongString = '1' + 'A'.repeat(10000);
      const result = safeValidate(alwaysSuccessValidator, veryLongString);
      expect(result.isValid).toBe(false);
      assertResultShape(result);
      if (!result.isValid) {
        expect(result.error).toContain('maximum length');
      }
    });

    it.each(['0xd8dA6BF\u000026964aF9D7eEd9e03E53415D37aA96045', '😃😃😃'])(
      'should fail on strings with control/unicode characters: %s',
      (input) => {
        const result = safeValidate(alwaysSuccessValidator, input);
        expect(result.isValid).toBe(false);
        assertResultShape(result);
        if (!result.isValid) {
          expect(result.error).toContain('invalid characters');
        }
      }
    );
  });

  describe('factory error handling', () => {
    it('catches exceptions from the inner validator and returns an Internal Error', () => {
      const result = safeValidate(throwingValidator, 'anything');
      expect(result.isValid).toBe(false);
      assertResultShape(result);
      if (!result.isValid) {
        expect(result.error).toMatch(/Internal Error: boom/);
      }
    });

    it('never throws for any input, even after an inner exception', () => {
      expect(() => throwingValidator('will-not-throw-outside')).not.toThrow();
    });
  });
});

const alwaysSuccessValidator = createValidator(
  (address: string, {success}: ValidationContext) => {
    return success('test', address);
  }
);

const throwingValidator = createValidator<ValidationResult<any>>(
  (_addr: string, _ctx: ValidationContext): ValidationResult<any> => {
    throw new Error('boom');
  }
);

function safeValidate<T extends ValidationResult<any>>(
  fn: (address: string) => T,
  input: any
): T {
  let result: T;
  expect(() => {
    result = fn(input as string);
  }).not.toThrow();
  return result!;
}

function assertResultShape(result: ValidationResult<any>) {
  expect(typeof result.isValid).toBe('boolean');
  if (result.isValid) {
    expect(result).toHaveProperty('type');
  } else {
    expect(result).toHaveProperty('error');
    expect(typeof result.error).toBe('string');
  }
}
