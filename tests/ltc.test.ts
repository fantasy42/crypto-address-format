import {describe, it, expect} from 'vite-plus/test';

import {validateLTC} from '../src/chains/ltc';
import {ValidationErrorCodes} from '../src/constants';

describe('validateLTC', () => {
  describe('positive cases (valid mainnet)', () => {
    it('validates legacy P2PKH (starts with L)', () => {
      const result = validateLTC('LaMZFeV1XdQ6yo8AzdrUHPrgKyfFmMG53b');
      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.type).toBe('P2PKH');
    });

    it('validates modern P2SH (starts with M)', () => {
      const result = validateLTC('MT2UaUAzwxhaP6WbqkVThnQ5Shn2zYZEh6');
      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.type).toBe('P2SH');
    });

    it('validates legacy P2SH (starts with 3)', () => {
      const result = validateLTC('3LpLGam2zqr9abEhjsW7t99g81Bavt3wY7');
      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.type).toBe('P2SH');
    });

    it('validates native SegWit v0 (Bech32)', () => {
      const result = validateLTC('ltc1qv43gel3n5hktls3tl0rpz3qrt98t0pavgaec9w');
      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.type).toBe('Bech32');
    });

    it('validates Taproot v1 (Bech32m)', () => {
      const result = validateLTC(
        'ltc1px9hnhzeryfrdq8srwtxj40phw8scg29euc726hg28xy96frk089q3d3t5f'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.type).toBe('Bech32m');
    });
  });

  describe('negative cases (invalid Base58)', () => {
    it('fails on invalid characters (0, O, I, l)', () => {
      const invalid = 'LbgJgM5YnLzP6M5Wq5V6yYZLqVq5V6yYZLqO'; // O instead of V
      const result = validateLTC(invalid);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_ENCODING);
      }
    });

    it('fails on Base58 checksum mismatch', () => {
      const invalid = 'LbgJgM5YnLzP6M5Wq5V6yYZLqVq5V6yYZLqF'; // last char changed
      const result = validateLTC(invalid);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
        expect(result.message).toContain('Checksum mismatch');
      }
    });

    it('fails on incorrect payload length', () => {
      const short = 'LbgJgM5YnLzP6M5Wq5V6yYZLqVq5V6yY'; // truncated
      const result = validateLTC(short);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toMatch(/INVALID_CHECKSUM|INVALID_LENGTH/);
      }
    });

    it('fails on unsupported version byte (Bitcoin address)', () => {
      const btcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      const result = validateLTC(btcAddress);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.UNSUPPORTED_TYPE);
      }
    });
  });

  describe('negative cases (invalid Bech32/Bech32m)', () => {
    it('fails on mixed-case', () => {
      const mixed = 'ltc1qW508d6qejxtdg4y5r3zarvary0C5xw7kv8f3t4';
      const result = validateLTC(mixed);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.MIXED_CASE);
        expect(result.message).toContain('Mixed case');
      }
    });

    it('fails on invalid HRP (bc1)', () => {
      const bcAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
      const result = validateLTC(bcAddress);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.UNSUPPORTED_TYPE);
      }
    });

    it('fails on invalid checksum', () => {
      const invalid = 'ltc1qyl0g7j3ew5czqzyjrxcth5p5u6hx0p2g5y2z2b';
      const result = validateLTC(invalid);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
        expect(result.message).toContain('checksum');
      }
    });

    it('fails on encoding-version mismatch (v1 with Bech32)', () => {
      const malformed =
        'ltc1pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhc79vu';
      const result = validateLTC(malformed);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toMatch(/INVALID_CHECKSUM|INVALID_ENCODING/);
      }
    });
  });

  describe('edge cases', () => {
    it('handles unsupported prefixes', () => {
      const result = validateLTC('random_string');
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.UNSUPPORTED_TYPE);
      }
    });

    it('handles extremely long strings gracefully', () => {
      const long = 'ltc1' + 'q'.repeat(200);
      const result = validateLTC(long);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBeDefined();
      }
    });
  });
});
