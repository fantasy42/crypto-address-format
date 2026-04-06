import {describe, it, expect} from 'vite-plus/test';

import {createValidator} from '../src/utils/createValidator';
import {getEVMLogic} from '../src/utils/evm';
import {runBaseValidatorTests} from './base.shared';

// Create a generic EVM validator to test the core logic
const validateGenericEVM = createValidator(getEVMLogic('GenericEVM'));

describe('EVM Logic validation (getEVMLogic)', () => {
  runBaseValidatorTests(validateGenericEVM);

  describe('positive cases', () => {
    it(`validates a valid eip-55 checksum address`, () => {
      const addr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      const result = validateGenericEVM(addr);
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('GenericEVM');
        expect(result.address).toBe(addr.toLowerCase());
      }
    });

    it('validates and normalizes mixed-case/uppercase addresses', () => {
      const lowercase = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
      const uppercase = '0XD8DA6BF26964AF9D7EED9E03E53415D37AA96045';

      [lowercase, uppercase].forEach((addr) => {
        const result = validateGenericEVM(addr);
        expect(result.isValid).toBe(true);
        if (result.isValid) {
          expect(result.address).toBe(lowercase);
        }
      });
    });

    it('validates an address consisting mostly of numbers', () => {
      const addr = '0x1111111111111111111111111111111111111111';
      const result = validateGenericEVM(addr);
      expect(result.isValid).toBe(true);
    });
  });

  describe('negative cases', () => {
    it('fails when a single checksum character is incorrectly cased', () => {
      const result = validateGenericEVM(
        '0xd8dA6bF26964aF9D7eEd9e03E53415D37aA96045'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toContain('checksum');
      }
    });

    it('fails on invalid hexadecimal characters', () => {
      expect(
        validateGenericEVM('0xG8dA6BF26964aF9D7eEd9e03E53415D37aA96045').isValid
      ).toBe(false);
    });

    it('rejects addresses with invalid lengths (not 42 characters)', () => {
      const tooShort = '0xd8da6bf26964af9d7eed9e03e53415d37aa96'; // 40 chars
      const tooLong = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA960451'; // 43 chars

      [tooShort, tooLong].forEach((addr) => {
        const result = validateGenericEVM(addr);
        expect(result.isValid).toBe(false);
        if (!result.isValid) {
          expect(result.error).toContain('length');
        }
      });
    });

    it('fails on missing or incorrect 0x prefix', () => {
      expect(
        validateGenericEVM('d8da6bf26964af9d7eed9e03e53415d37aa96045').isValid
      ).toBe(false);
      expect(
        validateGenericEVM('1xd8da6bf26964af9d7eed9e03e53415d37aa96045').isValid
      ).toBe(false);
    });

    it('rejects non-hexadecimal symbols (whitespace or special chars)', () => {
      expect(
        validateGenericEVM('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 ')
          .isValid
      ).toBe(false); // Trailing space
      expect(
        validateGenericEVM('0x!8dA6BF26964aF9D7eEd9e03E53415D37aA96045').isValid
      ).toBe(false); // Special char
    });
  });
});
