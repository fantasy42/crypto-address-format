import type {ValidationResult} from '../src/types';

import {expect, it, describe} from 'vite-plus/test';

export function runBaseValidatorTests(
  validateFn: (addr: any) => ValidationResult<any>,
  expectedErrorMessage: string = 'Address must be a non-empty string'
) {
  describe('base validation', () => {
    it('should fail on non-string inputs', () => {
      const inputs = [null, undefined, 123, {}, [], true];
      inputs.forEach((input) => {
        const result = validateFn(input);
        expect(result.isValid).toBe(false);
        if (!result.isValid) {
          expect(result.error).toContain(expectedErrorMessage);
        }
      });
    });

    it('should fail on empty or whitespace strings', () => {
      const inputs = ['', '   ', '\t', '\n'];
      inputs.forEach((input) => {
        const result = validateFn(input);
        expect(result.isValid).toBe(false);
      });
    });
  });
}
