import {describe, it, expect} from 'vite-plus/test';

import {createValidator} from '../src/utils/createValidator';
import {getEVMLogic} from '../src/utils/evm';
import {ValidationErrorCodes} from '../src/constants';

const validateGenericEVM = createValidator(getEVMLogic('GenericEVM'));

describe('EVM Logic validation (getEVMLogic)', () => {
  describe('positive cases', () => {
    it('validates a correct EIP-55 checksum address', () => {
      const addr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      const result = validateGenericEVM(addr);
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('GenericEVM');
        expect(result.address).toBe(addr.toLowerCase());
      }
    });

    it('accepts all-lowercase addresses', () => {
      const addr = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
      const result = validateGenericEVM(addr);
      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.address).toBe(addr);
    });

    it('accepts all-uppercase addresses (normalizes to lowercase)', () => {
      const addr = '0XD8DA6BF26964AF9D7EED9E03E53415D37AA96045';
      const result = validateGenericEVM(addr);
      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.address).toBe(addr.toLowerCase());
    });

    it('accepts the 0X uppercase prefix variant', () => {
      const addr = '0XD8DA6BF26964AF9D7EED9E03E53415D37AA96045';
      const result = validateGenericEVM(addr);
      expect(result.isValid).toBe(true);
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
        expect(result.code).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
        expect(result.message).toContain('checksum');
      }
    });

    it('fails on invalid hexadecimal characters', () => {
      const result = validateGenericEVM(
        '0xG8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_FORMAT);
        expect(result.message).toContain('hexadecimal');
      }
    });

    it('rejects addresses with invalid length (not 42 chars)', () => {
      const tooShort = '0xd8da6bf26964af9d7eed9e03e53415d37aa96';
      const tooLong = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA960451';
      [tooShort, tooLong].forEach((addr) => {
        const result = validateGenericEVM(addr);
        expect(result.isValid).toBe(false);
        if (!result.isValid) {
          expect(result.code).toBe(ValidationErrorCodes.INVALID_LENGTH);
          expect(result.message).toContain('length');
        }
      });
    });

    it('fails on missing or incorrect 0x prefix', () => {
      const wrongPrefix = '0yd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      const wrongPrefix2 = 'xxd8da6bf26964af9d7eed9e03e53415d37aa96045';
      [wrongPrefix, wrongPrefix2].forEach((addr) => {
        const result = validateGenericEVM(addr);
        expect(result.isValid).toBe(false);
        if (!result.isValid) {
          expect(result.code).toBe(ValidationErrorCodes.INVALID_PREFIX);
          expect(result.message).toContain('prefix');
        }
      });
    });

    it('rejects non-hex symbols', () => {
      const specialChar = '0x!8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      const result = validateGenericEVM(specialChar);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_FORMAT);
        expect(result.message).toContain('hexadecimal');
      }
    });

    it('rejects 0X prefix with incorrect checksum', () => {
      const addr = '0XD8dA6BF26964aF9D7eEd9e03E53415D37aA96044';
      const result = validateGenericEVM(addr);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
        expect(result.message).toContain('checksum');
      }
    });
  });
});
