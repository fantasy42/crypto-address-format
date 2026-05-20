import {describe, it, expect} from 'vite-plus/test';

import {createBaseCodec} from '../baseCodec';
import {BTC_ALPHABET} from '../alphabets';

const codec = createBaseCodec(BTC_ALPHABET);

describe('baseCodec (Base58 BTC)', () => {
  describe('encode', () => {
    it('encodes an empty buffer to an empty string', () => {
      expect(codec.encode(new Uint8Array())).toBe('');
    });

    it('encodes a zero byte as the leader character', () => {
      expect(codec.encode(new Uint8Array([0]))).toBe(BTC_ALPHABET[0]);
    });

    it('encodes multiple leading zeros', () => {
      const input = new Uint8Array([0, 0, 1]);
      const expected =
        BTC_ALPHABET[0] + BTC_ALPHABET[0] + codec.encode(new Uint8Array([1]));
      expect(codec.encode(input)).toBe(expected); // '112'
    });

    it('encodes zero-only payloads', () => {
      expect(codec.encode(new Uint8Array([0, 0, 0, 0]))).toBe('1111');
      expect(codec.encode(new Uint8Array([0, 0]))).toBe('11');
      expect(codec.encode(new Uint8Array([0]))).toBe('1');
    });

    it('accepts number arrays', () => {
      expect(codec.encode([0, 1])).toBe(codec.encode(new Uint8Array([0, 1])));
    });

    it('accepts ArrayBufferView', () => {
      const buf = new Uint8Array([5, 6]).buffer;
      const view = new Uint8Array(buf, 0, 2);
      expect(codec.encode(view)).toBe(codec.encode(new Uint8Array([5, 6])));
    });

    it('throws on invalid input type', () => {
      expect(() => (codec as any).encode('string')).toThrow(TypeError);
      expect(() => (codec as any).encode(null)).toThrow(TypeError);
    });
  });

  describe('decodeUnsafe', () => {
    it('decodes an empty string to an empty buffer', () => {
      const res = codec.decodeUnsafe('');
      expect(res).toBeInstanceOf(Uint8Array);
      expect(res!.length).toBe(0);
    });

    it('decodes the leader character to a single zero byte', () => {
      expect(codec.decodeUnsafe(BTC_ALPHABET[0])).toEqual(new Uint8Array([0]));
    });

    it('preserves leading zeros', () => {
      const res = codec.decodeUnsafe('112');
      expect(res).toEqual(new Uint8Array([0, 0, 1]));
    });

    it('decodes a string of only leader characters to the correct number of zero bytes', () => {
      expect(codec.decodeUnsafe('11')).toEqual(new Uint8Array([0, 0]));
      expect(codec.decodeUnsafe('111')).toEqual(new Uint8Array([0, 0, 0]));
      expect(codec.decodeUnsafe('1')).toEqual(new Uint8Array([0]));
    });

    it('returns undefined for characters not in the alphabet', () => {
      expect(codec.decodeUnsafe('0')).toBeUndefined();
      expect(codec.decodeUnsafe('O')).toBeUndefined();
      expect(codec.decodeUnsafe('l')).toBeUndefined();
      expect(codec.decodeUnsafe('_')).toBeUndefined();
    });

    it('returns undefined for strings with code points > 255', () => {
      expect(codec.decodeUnsafe('😀')).toBeUndefined();
    });

    it('throws on non-string input', () => {
      expect(() => (codec as any).decodeUnsafe(123)).toThrow(TypeError);
      expect(() => (codec as any).decodeUnsafe(null)).toThrow(TypeError);
    });
  });

  describe('decode', () => {
    it('decodes a valid string like decodeUnsafe', () => {
      expect(codec.decode('112')).toEqual(new Uint8Array([0, 0, 1]));
    });

    it('throws on invalid characters', () => {
      expect(() => codec.decode('0')).toThrow(/Invalid character/);
      expect(() => codec.decode('_')).toThrow(/Invalid character/);
    });
  });

  describe('round‑trip consistency', () => {
    it('works for random payloads', () => {
      for (let i = 0; i < 100; i++) {
        const len = Math.floor(Math.random() * 20) + 1;
        const payload = new Uint8Array(len);
        for (let j = 0; j < len; j++) {
          payload[j] = Math.floor(Math.random() * 256);
        }
        const encoded = codec.encode(payload);
        const decoded = codec.decode(encoded);
        expect(decoded).toEqual(payload);
      }
    });

    it('works for zero‑heavy payloads', () => {
      const payload = new Uint8Array([0, 0, 0, 5, 6]);
      const encoded = codec.encode(payload);
      const decoded = codec.decode(encoded);
      expect(decoded).toEqual(payload);
    });
  });
});
