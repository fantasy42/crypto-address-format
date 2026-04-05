import {describe, it, expect} from 'vite-plus/test';

import {validateTRX} from '../src/chains/trx';
import {runBaseValidatorTests} from './base.shared';

describe('validatetrx', () => {
  runBaseValidatorTests(validateTRX);

  describe('positive cases (valid mainnet)', () => {
    it('validates a standard TRON address (T-prefix)', () => {
      // TRON Foundation address
      const address = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
      const result = validateTRX(address);

      expect(result.isValid).toBe(true);

      if (result.isValid) {
        expect(result.type).toBe('TRON');
        expect(result.address).toBe(address);
      }
    });

    it('validates another valid mainnet address', () => {
      const result = validateTRX('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');

      expect(result.isValid).toBe(true);
    });
  });

  describe('negative cases (invalid base58check)', () => {
    it('fails on invalid characters (0, O, I, l)', () => {
      const result = validateTRX('T7z5Tf9jj1k2a4VZqL4mKjD6CZ1ePZa1wO'); // 'O' instead of '6'

      expect(result.isValid).toBe(false);
    });

    it('fails on base58 checksum mismatch', () => {
      // Swapping last character from 6 to 7
      const result = validateTRX('T7z5Tf9jj1k2a4VZqL4mKjD6CZ1ePZa1w7');

      expect(result.isValid).toBe(false);

      if (!result.isValid) {
        expect(result.error).toContain('Checksum mismatch');
      }
    });

    it('fails on incorrect payload length', () => {
      const result = validateTRX('T7z5Tf9jj1k2a4VZqL4mKjD6CZ1ePZa1'); // Too short

      expect(result.isValid).toBe(false);

      if (!result.isValid) {
        expect(result.error).toContain('length');
      }
    });

    it('fails on incorrect version prefix (not 0x41)', () => {
      // This is a valid BTC address (starts with 1, version 0x00)
      // but provided to the TRX validator
      const result = validateTRX('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

      expect(result.isValid).toBe(false);

      if (!result.isValid) {
        // Our utility provides specific version error messages
        expect(result.error).toContain('prefix');
      }
    });
  });

  describe('edge cases', () => {
    it('handles unexpected formats', () => {
      expect(validateTRX('ethereum_style_0x123...').isValid).toBe(false);
      expect(
        validateTRX('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4').isValid
      ).toBe(false);
    });
  });
});
