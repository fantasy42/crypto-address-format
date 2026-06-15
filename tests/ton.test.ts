import {describe, it, expect} from 'vite-plus/test';

import {crc16Ton} from '../src/utils/crc16';
import {validateTON} from '../src/chains/ton';
import {ValidationErrorCodes} from '../src/constants';

describe('validateton', () => {
  describe('positive cases (valid mainnet & testnet)', () => {
    it('validates user-friendly bounceable testnet address', () => {
      const result = validateTON(
        'kQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi47nL'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('UserFriendly-Testnet-Bounceable');
        expect(result.address).toBe(
          'kQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi47nL'
        );
      }
    });

    it('validates user-friendly non-bounceable testnet address', () => {
      const result = validateTON(
        '0QAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi4-QO'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('UserFriendly-Testnet-NonBounceable');
      }
    });

    it('validates user-friendly bounceable mainnet address', () => {
      const result = validateTON(
        'EQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi4wJB'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('UserFriendly-Bounceable');
      }
    });

    it('validates user-friendly bounceable mainnet address (standard base64 variant)', () => {
      const result = validateTON(
        'EQAs9VlT6S776tq3unJcP5Ogsj+ELLunLXuOb1EKcOQi4wJB'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('UserFriendly-Bounceable');
      }
    });

    it('validates user-friendly non-bounceable mainnet address', () => {
      const result = validateTON(
        'UQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi41-E'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('UserFriendly-NonBounceable');
      }
    });

    it('validates user-friendly non-bounceable mainnet address (standard base64 variant)', () => {
      const result = validateTON(
        'UQAs9VlT6S776tq3unJcP5Ogsj+ELLunLXuOb1EKcOQi41+E'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('UserFriendly-NonBounceable');
      }
    });

    it('validates raw base workchain address', () => {
      const result = validateTON(
        '0:2cf55953e92efbeadab7ba725c3f93a0b23f842cbba72d7b8e6f510a70e422e3'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('Raw');
      }
    });

    it('validates raw masterchain address with negative workchain prefix', () => {
      const result = validateTON(
        '-1:3333333333333333333333333333333333333333333333333333333333333333'
      );
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe('Raw');
      }
    });
  });

  describe('negative cases (invalid user-friendly vectors)', () => {
    it('fails on unexpected protocol deep link prefixes', () => {
      const result = validateTON(
        'ton://EQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi4wJB'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_FORMAT);
      }
    });

    it('fails on complex routing transaction transfers strings', () => {
      const result = validateTON(
        'ton://transfer/EQDXDCFLXgiTrjGSNVBuvKPZVYlPn3J_u96xxLas3_yoRWRk'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_FORMAT);
      }
    });

    it('fails on user-friendly addresses with illegal lengths', () => {
      const result = validateTON(
        'EQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi4wJ'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.UNSUPPORTED_TYPE);
      }
    });

    it('fails on invalid arbitrary layout strings containing wildcards', () => {
      const result = validateTON(
        '!@#$%^&*AAAAAAAAAAAAAA AAAAAAAAAA AAAAAAAAAAAA A'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.UNSUPPORTED_TYPE);
      }
    });

    it('fails on a valid-length address with a corrupted checksum', () => {
      const result = validateTON(
        'EQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi4wJC'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
        expect(result.message).toContain('checksum');
      }
    });

    it('fails on a user‑friendly address with an unknown tag byte', () => {
      // Manually craft a 36‑byte address with a bogus tag (0x00) and valid CRC.
      // The payload (34 bytes) is all zeros except tag=0x00, then compute CRC.
      const payload = new Uint8Array(34); // tag 0x00, workchain 0, zero hash
      const crc = crc16Ton(payload);
      const raw = new Uint8Array(36);
      raw.set(payload);
      raw.set(crc, 34);
      const badTagAddress = Buffer.from(raw).toString('base64url'); // or base64, both accepted

      const result = validateTON(badTagAddress);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_FORMAT);
        expect(result.message).toContain('tag');
      }
    });
  });

  describe('negative cases (invalid raw structures)', () => {
    it('fails on truncated or short raw cryptographic hashes (length 63)', () => {
      const result = validateTON(
        '0:2cf55953e92efbeadab7ba725c3f93a0b23f842cbba72d7b8e6f510a70e422e'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_FORMAT);
      }
    });

    it('fails on extremely truncated raw hash contexts (length 62)', () => {
      const result = validateTON(
        '0:2cf55953e92efbeadab7ba725c3f93a0b23f842cbba72d7b8e6f510a70e422'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_FORMAT);
      }
    });

    it('fails if raw addresses hide functional user-friendly addresses inside payload values', () => {
      const result = validateTON(
        '0:EQDXDCFLXgiTrjGSNVBuvKPZVYlPn3J_u96xxLas3_yoRWRk'
      );
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_FORMAT);
      }
    });
  });

  describe('edge cases', () => {
    it('handles unexpected structural formats safely', () => {
      const result1 = validateTON('bitcoin_style_address');
      expect(result1.isValid).toBe(false);
      if (!result1.isValid) {
        expect(result1.code).toBe(ValidationErrorCodes.UNSUPPORTED_TYPE);
      }

      const result2 = validateTON('0x1234567890abcdef1234567890abcdef12345678');
      expect(result2.isValid).toBe(false);
      if (!result2.isValid) {
        expect(result2.code).toBe(ValidationErrorCodes.UNSUPPORTED_TYPE);
      }
    });
  });
});
