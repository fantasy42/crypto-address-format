import {describe, it, expect} from 'vite-plus/test';

import {validateXLM} from '../src/chains/xlm';
import {ValidationErrorCodes} from '../src/constants';

describe('validateXLM', () => {
  describe('positive cases (valid mainnet)', () => {
    it('accepts a standard G… address', () => {
      const result = validateXLM(
        'GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.type).toBe('Standard');
    });

    it('accepts a muxed M… address', () => {
      const result = validateXLM(
        'MA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUAAAAAAAAAABUTGI4'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.type).toBe('Muxed');
    });
  });

  describe('negative cases (invalid format)', () => {
    it('rejects unsupported prefix (S, B, etc.)', () => {
      const r1 = validateXLM(
        'SAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGFA5FSSUBWBK7H53A5OPM'
      );
      expect(r1.isValid).toBe(false);
      if (!r1.isValid) {
        expect(r1.code).toBe(ValidationErrorCodes.INVALID_PREFIX);
      }

      const r2 = validateXLM(
        'BAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGFA5FSSUBWBK7H53A5OPM'
      );
      expect(r2.isValid).toBe(false);
      if (!r2.isValid) {
        expect(r2.code).toBe(ValidationErrorCodes.INVALID_PREFIX);
      }
    });

    it('rejects wrong length for G', () => {
      const result = validateXLM(
        'GA7FCCWP2YRFQWJ5M7BHBIXSMJJJBSUZWHCSVMRBXVTXM7RF4J6EUOJ'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_LENGTH);
      }
    });

    it('rejects wrong length for M', () => {
      const result = validateXLM(
        'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGFA5FSSUBWBK7H53A5OP'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_LENGTH);
      }
    });

    it('rejects invalid Base32 characters', () => {
      const result = validateXLM(
        'GA7FCCWP2YRFQWJ5M7BHBIXSMJJJBSUZWHCSVMRBXVTXM7RF4J6EUO17'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_ENCODING);
        expect(result.message).toContain('Base32');
      }
    });

    it('rejects bad checksum', () => {
      // Change last char from 7 to A (valid base32) to break checksum
      const result = validateXLM(
        'GA7FCCWP2YRFQWJ5M7BHBIXSMJJJBSUZWHCSVMRBXVTXM7RF4J6EUOJA'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
        expect(result.message).toContain('Checksum mismatch');
      }
    });
  });
});
