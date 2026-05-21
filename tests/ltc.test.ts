import {describe, it, expect} from 'vite-plus/test';

import {validateLTC} from '../src/chains/ltc';

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
      expect(validateLTC(invalid).isValid).toBe(false);
    });

    it('fails on Base58 checksum mismatch', () => {
      const invalid = 'LbgJgM5YnLzP6M5Wq5V6yYZLqVq5V6yYZLqF'; // last char changed
      const result = validateLTC(invalid);
      expect(result.isValid).toBe(false);
      if (!result.isValid) expect(result.error).toContain('Checksum mismatch');
    });

    it('fails on incorrect payload length', () => {
      const short = 'LbgJgM5YnLzP6M5Wq5V6yYZLqVq5V6yY'; // truncated
      expect(validateLTC(short).isValid).toBe(false);
    });

    it('fails on unsupported version byte (Bitcoin address)', () => {
      const btcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
      const result = validateLTC(btcAddress);
      expect(result.isValid).toBe(false);
      if (!result.isValid)
        expect(result.error).toMatch(/Unsupported address format/);
    });
  });

  describe('negative cases (invalid Bech32/Bech32m)', () => {
    it('fails on mixed-case', () => {
      const mixed = 'ltc1qW508d6qejxtdg4y5r3zarvary0C5xw7kv8f3t4';
      const result = validateLTC(mixed);
      expect(result.isValid).toBe(false);
      if (!result.isValid) expect(result.error).toContain('Mixed case');
    });

    it('fails on invalid HRP (bc1)', () => {
      const bcAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
      const result = validateLTC(bcAddress);
      expect(result.isValid).toBe(false);
      if (!result.isValid)
        expect(result.error).toMatch(/Unsupported address format/);
    });

    it('fails on invalid checksum', () => {
      const invalid = 'ltc1qyl0g7j3ew5czqzyjrxcth5p5u6hx0p2g5y2z2b';
      const result = validateLTC(invalid);
      expect(result.isValid).toBe(false);
      if (!result.isValid) expect(result.error).toContain('checksum');
    });

    it('fails on encoding-version mismatch (v1 with Bech32)', () => {
      const malformed =
        'ltc1pqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqhc79vu';

      const result = validateLTC(malformed);
      expect(result.isValid).toBe(false);
      if (!result.isValid)
        expect(result.error).toMatch(/Version 1\+ must use Bech32m/);
    });
  });

  describe('edge cases', () => {
    it('handles unsupported prefixes', () => {
      expect(validateLTC('random_string').isValid).toBe(false);
    });

    it('handles extremely long strings gracefully', () => {
      const long = 'ltc1' + 'q'.repeat(200);
      expect(validateLTC(long).isValid).toBe(false);
    });
  });
});
