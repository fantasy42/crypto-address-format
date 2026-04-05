import {describe, it, expect} from 'vite-plus/test';

import {validateBTC} from '../src/chains/btc';
import {runBaseValidatorTests} from './base.shared';

describe('validatebtc', () => {
  runBaseValidatorTests(validateBTC);

  describe('positive cases (valid mainnet)', () => {
    it('validates legacy (p2pkh)', () => {
      const result = validateBTC('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

      expect(result.isValid).toBe(true);

      if (result.isValid) {
        expect(result.type).toBe('P2PKH');
      }
    });

    it('validates p2sh', () => {
      const result = validateBTC('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy');

      expect(result.isValid).toBe(true);

      if (result.isValid) {
        expect(result.type).toBe('P2SH');
      }
    });

    it('validates native segwit (bech32/v0)', () => {
      const result = validateBTC('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');

      expect(result.isValid).toBe(true);

      if (result.isValid) {
        expect(result.type).toBe('Bech32');
      }
    });

    it('validates taproot (bech32m/v1)', () => {
      const result = validateBTC(
        'bc1pgn0mhnu0aqe888sqh5mewlvt26gcr4v6d886qt3hxxfspuwpqx2q4xk59v'
      );

      expect(result.isValid).toBe(true);

      if (result.isValid) {
        expect(result.type).toBe('Bech32m');
      }
    });
  });

  describe('negative cases (invalid base58)', () => {
    it('fails on invalid characters (0, o, i, l)', () => {
      const result = validateBTC('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNO');

      expect(result.isValid).toBe(false);
    });

    it('fails on base58 checksum mismatch', () => {
      const result = validateBTC('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb');

      expect(result.isValid).toBe(false);

      if (!result.isValid) {
        expect(result.error).toContain('Checksum mismatch');
      }
    });

    it('fails on incorrect payload length', () => {
      const result = validateBTC('1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf');

      expect(result.isValid).toBe(false);
    });
  });

  describe('negative cases (invalid bech32/bech32m)', () => {
    it('fails on mixed-case (bip173 violation)', () => {
      const result = validateBTC('bc1qW508d6qejxtdg4y5r3zarvary0C5xw7kv8f3t4');

      expect(result.isValid).toBe(false);

      if (!result.isValid) {
        expect(result.error).toContain('Mixed case');
      }
    });

    it('fails on invalid checksum (the specific failing vector from earlier)', () => {
      const result = validateBTC(
        'bc1p5cyxml0anv4n6480uqv0f666k20m5j48st6v6evqfpxm7qqvpxfs399a95'
      );

      expect(result.isValid).toBe(false);

      if (!result.isValid) {
        expect(result.error).toContain('checksum');
      }
    });

    it('fails on encoding-version mismatch (bip350 enforcement)', () => {
      const v1WithBech32 = 'bc1p0xlxvl9ghp0g64p66llp95m4mg6u00cd677ntn6qyc2c';
      const result = validateBTC(v1WithBech32);
      expect(result.isValid).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles unsupported prefixes', () => {
      expect(validateBTC('4A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa').isValid).toBe(
        false
      );
      expect(validateBTC('dogecoin_address').isValid).toBe(false);
    });
  });
});
