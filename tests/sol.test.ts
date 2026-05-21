import {describe, it, expect} from 'vite-plus/test';

import {validateSOL} from '../src/chains/sol';

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
      expect(
        validateSOL('7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLt').isValid
      ).toBe(false);
      const long = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtVaa';
      expect(validateSOL(long).isValid).toBe(false);
    });

    it('rejects invalid Base58 characters (0, O, I, l)', () => {
      expect(
        validateSOL('0EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV').isValid
      ).toBe(false);
      expect(validateSOL('OIinvaliD').isValid).toBe(false);
    });

    it('rejects valid Base58 but wrong decoded length', () => {
      const shortKey = '2n4E4gULW4M3n5Y4Sj1jL6k9p9zZ8g3GwXbQ1DpQF8k';
      const result = validateSOL(shortKey);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toMatch(/32 bytes/);
      }
    });

    it('rejects valid Base58 that decodes to something other than 32 bytes', () => {
      const shortKey = '2n4E4gULW4M3n5Y4Sj1jL6k9p9zZ8g3GwXbQ1DpQF8k';
      const result = validateSOL(shortKey);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toMatch(/exactly 32 bytes/);
      }
    });

    it('rejects addresses with internal whitespace', () => {
      const result = validateSOL(
        '7EcDhSYGxXyscszYEp35KHN8vvw3 svAuLKTzXwCFLtV'
      );
      expect(result.isValid).toBe(false);
    });
  });
});
