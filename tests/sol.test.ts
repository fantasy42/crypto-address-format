import {describe, it, expect} from 'vite-plus/test';

import {validateSOL} from '../src/chains/sol';
import {ValidationErrorCodes} from '../src/constants';

describe('validateSOL', () => {
  describe('positive cases (valid mainnet)', () => {
    it('accepts a standard wallet address', () => {
      const result = validateSOL('7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV');
      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.type).toBe('Solana');
    });

    it('accepts a PDA-like address (off-curve key)', () => {
      const result = validateSOL(
        '6bG28uJMiDi7xGkGsJXY8CtkhkxCJPkKLNV2Dffz2ZHX'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) expect(result.type).toBe('Solana');
    });
  });

  describe('negative cases (invalid format)', () => {
    it('rejects too short or too long strings', () => {
      const short = validateSOL('7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLt');
      expect(short.isValid).toBe(false);
      if (!short.isValid) {
        expect(short.code).toBe(ValidationErrorCodes.INVALID_FORMAT);
        expect(short.message).toContain('32 bytes');
      }

      const long = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtVaa';
      const longResult = validateSOL(long);
      expect(longResult.isValid).toBe(false);
      if (!longResult.isValid) {
        expect(longResult.code).toBe(ValidationErrorCodes.INVALID_LENGTH);
      }
    });

    it('rejects invalid Base58 characters (0, O, I, l)', () => {
      const withZero = validateSOL(
        '0EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV'
      );
      expect(withZero.isValid).toBe(false);
      if (!withZero.isValid) {
        expect(withZero.code).toBe(ValidationErrorCodes.INVALID_ENCODING);
        expect(withZero.message).toContain('Base58');
      }

      const withOI = validateSOL('OIinvaliD');
      expect(withOI.isValid).toBe(false);
      if (!withOI.isValid) {
        expect(withOI.code).toBe(ValidationErrorCodes.INVALID_LENGTH);
      }
    });

    it('rejects valid Base58 but wrong decoded length', () => {
      const shortKey = '2n4E4gULW4M3n5Y4Sj1jL6k9p9zZ8g3GwXbQ1DpQF8k';
      const result = validateSOL(shortKey);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_FORMAT);
        expect(result.message).toContain('32 bytes');
      }
    });

    it('rejects valid Base58 that decodes to something other than 32 bytes', () => {
      const shortKey = '2n4E4gULW4M3n5Y4Sj1jL6k9p9zZ8g3GwXbQ1DpQF8k';
      const result = validateSOL(shortKey);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_FORMAT);
        expect(result.message).toContain('exactly 32 bytes');
      }
    });

    it('rejects addresses with internal whitespace', () => {
      const result = validateSOL(
        '7EcDhSYGxXyscszYEp35KHN8vvw3 svAuLKTzXwCFLtV'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_ENCODING);
      }
    });
  });
});
