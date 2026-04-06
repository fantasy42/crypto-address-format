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

    it('should fail on objects disguised as strings', () => {
      const fakeString = {
        toString: () => '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      };
      const result = validateFn(fakeString as any);
      expect(result.isValid).toBe(false);
    });

    it('should fail safely on extremely long strings', () => {
      const veryLongString = '0x' + 'a'.repeat(10000);
      const result = validateFn(veryLongString);
      expect(result.isValid).toBe(false);
    });

    it('should handle strings with control/unicode characters safely', () => {
      const inputs = [
        '0xd8dA6BF\u000026964aF9D7eEd9e03E53415D37aA96045',
        '😃😃😃',
      ];
      inputs.forEach((input) => {
        const result = validateFn(input);
        expect(result.isValid).toBe(false);
      });
    });
  });
}
