import {describe, it, expect} from 'vite-plus/test';

import {validateETH} from '../src/chains/eth';

describe('validateeth', () => {
  describe('positive cases (valid mainnet)', () => {
    it('validates a valid eip-55 checksum address', () => {
      const result = validateETH('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.type).toBe('Ethereum');
    });

    it('validates a lowercase address', () => {
      const result = validateETH('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');

      expect(result.isValid).toBe(true);
    });

    it('validates an uppercase address', () => {
      const result = validateETH('0XD8DA6BF26964AF9D7EED9E03E53415D37AA96045');

      expect(result.isValid).toBe(true);
    });

    it('validates an address with only numbers', () => {
      // Addresses with no letters are technically valid and don't require checksums
      const result = validateETH('0x0000000000000000000000000000000000000000');

      expect(result.isValid).toBe(true);
    });
  });

  describe('negative cases', () => {
    it('fails on invalid checksum (case mismatch)', () => {
      const result = validateETH('0xd8dA6bF26964aF9D7eEd9e03E53415D37aA96045');

      expect(result.isValid).toBe(false);

      if (!result.isValid) {
        expect(result.error).toContain('checksum');
      }
    });

    it('fails on invalid characters', () => {
      expect(
        validateETH('0xG8dA6BF26964aF9D7eEd9e03E53415D37aA96045').isValid
      ).toBe(false);
    });

    it('fails on incorrect length', () => {
      expect(
        validateETH('0xd8da6bf26964af9d7eed9e03e53415d37aa96').isValid
      ).toBe(false);
    });

    it('fails on missing 0x prefix', () => {
      expect(
        validateETH('d8da6bf26964af9d7eed9e03e53415d37aa96045').isValid
      ).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles empty or non-string input gracefully', () => {
      // @ts-expect-error
      expect(validateETH(null).isValid).toBe(false);
      expect(validateETH('').isValid).toBe(false);
    });
  });
});
