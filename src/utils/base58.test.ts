import {describe, it, expect} from 'vite-plus/test';

import {base58, base58Xrp} from './base58';

describe('base58 codec instances', () => {
  describe('base58', () => {
    it('exposes the expected interface', () => {
      expect(typeof base58.encode).toBe('function');
      expect(typeof base58.decode).toBe('function');
      expect(typeof base58.decodeUnsafe).toBe('function');
    });

    it('round‑trips an empty buffer', () => {
      const bytes = new Uint8Array([]);
      const encoded = base58.encode(bytes);
      expect(encoded).toBe('');
      expect(base58.decode(encoded)).toEqual(bytes);
    });

    it('round‑trips leading zero bytes', () => {
      const bytes = new Uint8Array([0, 0, 0, 1]);
      const encoded = base58.encode(bytes);
      expect(encoded).toBe('111' + base58.encode(new Uint8Array([1])));
      expect(base58.decode(encoded)).toEqual(bytes);
    });

    it('rejects characters not in the Bitcoin alphabet', () => {
      expect(base58.decodeUnsafe('0')).toBeUndefined(); // '0' not in Base58
      expect(base58.decodeUnsafe('O')).toBeUndefined();
      expect(base58.decodeUnsafe('l')).toBeUndefined();
      expect(base58.decodeUnsafe('I')).toBeUndefined();
      expect(() => base58.decode('0')).toThrow();
    });

    it('handles a known 20‑byte hash', () => {
      const hash = new Uint8Array([
        0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
        0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13,
      ]);
      const encoded = base58.encode(hash);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
      expect(base58.decode(encoded)).toEqual(hash);
    });
  });

  describe('base58Xrp', () => {
    it('exposes the expected interface', () => {
      expect(typeof base58Xrp.encode).toBe('function');
      expect(typeof base58Xrp.decode).toBe('function');
      expect(typeof base58Xrp.decodeUnsafe).toBe('function');
    });

    it('round‑trips a 20‑byte XRP account ID', () => {
      const accountId = new Uint8Array([
        0x5e, 0xa4, 0x8b, 0x40, 0xec, 0x9b, 0x4c, 0x7b, 0xa0, 0xc4, 0x3e, 0xda,
        0x2d, 0x67, 0xc5, 0xb8, 0x7d, 0x2b, 0x9f, 0x16,
      ]);
      const encoded = base58Xrp.encode(accountId);
      expect(typeof encoded).toBe('string');
      expect(base58Xrp.decode(encoded)).toEqual(accountId);
    });

    it('rejects characters not in the XRP alphabet', () => {
      expect(base58Xrp.decodeUnsafe('O')).toBeUndefined();
      expect(base58Xrp.decodeUnsafe('I')).toBeUndefined();
      expect(() => base58Xrp.decode('O')).toThrow();
    });

    it('handles leading zeros correctly', () => {
      const bytes = new Uint8Array([0, 0, 5]);
      const encoded = base58Xrp.encode(bytes);
      expect(encoded[0]).toBe(base58Xrp.encode(new Uint8Array([0]))[0]); // leader char
      expect(base58Xrp.decode(encoded)).toEqual(bytes);
    });
  });
});
