import {describe, it, expect} from 'vite-plus/test';
import {validateXRP} from '../src/chains/xrp';

describe('validateXRP', () => {
  describe('positive cases (valid addresses)', () => {
    it('validates a standard classic r-address', () => {
      const address = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
      const result = validateXRP(address);

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('Classic');
        expect(result.address).toBe(address);
      }
    });

    it('validates a mainnet x-address', () => {
      const address = 'XVLhHMPHU98es4dbozjVtdWzVrDjtV18pX8yuPT7y4xaEHi';
      const result = validateXRP(address);

      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('X-Address-Mainnet');
      }
    });
  });

  describe('negative cases (invalid base58)', () => {
    it('fails on invalid characters (0, O, I, l)', () => {
      const result = validateXRP('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTO');
      expect(result.isValid).toBe(false);
    });

    it('fails on base58 checksum mismatch', () => {
      const result = validateXRP('rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTi');

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toContain('Checksum mismatch');
      }
    });

    it('fails on incorrect payload length (Classic)', () => {
      const result = validateXRP('rHb9CJAWyB4rj91VRWn96Dk');
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toMatch(/length|structure/i);
      }
    });
  });

  describe('negative cases (X-Address specific)', () => {
    it('fails on X-Address prefix tampering', () => {
      const tampered = 'X7f9HCLVp8scA6Eof9idVP6F8L6T8oQZqZ56qR8wAnTscEa';
      const result = validateXRP(tampered);

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toBe('Checksum mismatch');
      }
    });

    it('fails on X-Address version mismatch (tampering)', () => {
      const testnetAddr = 'T7jkn8zYC2NhPdcbVxkiEXZGy56YiEE4P7uXRgpy5j4Q6S1';
      const result = validateXRP(testnetAddr);

      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toBe('Unsupported XRP address prefix');
      }
    });

    it('fails on malformed X-Address length', () => {
      const result = validateXRP('XVLhHMPHU98es4dbozjVtdWzVrDjtV18pX8yuPT7');
      expect(result.isValid).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles empty or non-string input gracefully', () => {
      // @ts-expect-error
      expect(validateXRP(null).isValid).toBe(false);
      expect(validateXRP('').isValid).toBe(false);
      // @ts-expect-error
      expect(validateXRP(undefined).isValid).toBe(false);
    });

    it('handles other chain formats (ETH and BTC)', () => {
      // Ethereum
      expect(
        validateXRP('0x742d35Cc6634C0532925a3b844Bc454e4438f44e').isValid
      ).toBe(false);
      // Bitcoin SegWit (Bech32)
      expect(
        validateXRP('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4').isValid
      ).toBe(false);
    });

    it('fails on unsupported start characters', () => {
      // XRP addresses must start with r, X, or T
      expect(validateXRP('sHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh').isValid).toBe(
        false
      );
      expect(validateXRP('1Hb9CJAWyB4rj91VRWn96DkukG4bwdtyTh').isValid).toBe(
        false
      );
    });

    it('is case sensitive', () => {
      // Classic addresses must start with lowercase 'r'
      expect(validateXRP('RHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh').isValid).toBe(
        false
      );
    });
  });
});
