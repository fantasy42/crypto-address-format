import {describe, it, expect} from 'vite-plus/test';
import {sha256} from '@noble/hashes/sha2.js';

import {base58Check, Base58CheckErrorCode} from '../base58Check';
import {base58, base58Xrp} from '../base58';
import {createBaseCodec} from '../baseCodec';

function encodeBase58Check(
  codec: ReturnType<typeof createBaseCodec>,
  versionedPayload: Uint8Array
): string {
  const checksum = sha256(sha256(versionedPayload)).subarray(0, 4);
  const combined = new Uint8Array(versionedPayload.length + 4);
  combined.set(versionedPayload);
  combined.set(checksum, versionedPayload.length);
  return codec.encode(combined);
}

describe('base58Check', () => {
  const samplePayload = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    samplePayload[i] = i + 1;
  }

  describe('successful validation', () => {
    it('validates a Bitcoin-style address (single version byte 0x00)', () => {
      const version = 0x00;
      const versioned = new Uint8Array(21);
      versioned[0] = version;
      versioned.set(samplePayload, 1);
      const addr = encodeBase58Check(base58, versioned);

      const result = base58Check(addr, {codec: base58});
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.version).toBe(version);
        expect(result.payload).toEqual(samplePayload);
      }
    });

    it('validates a TRON-style address (single version byte 0x41)', () => {
      const version = 0x41;
      const versioned = new Uint8Array(21);
      versioned[0] = version;
      versioned.set(samplePayload, 1);
      const addr = encodeBase58Check(base58, versioned);

      const result = base58Check(addr, {
        codec: base58,
        expectedVersion: 0x41,
      });
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.version).toBe(version);
        expect(result.payload).toEqual(samplePayload);
      }
    });

    it('validates an XRP-style address with a two‑byte version', () => {
      const versions = [0x05, 0x44];
      const versioned = new Uint8Array(22);
      versioned[0] = versions[0];
      versioned[1] = versions[1];
      versioned.set(samplePayload, 2);
      const addr = encodeBase58Check(base58Xrp, versioned);

      const result = base58Check(addr, {
        codec: base58Xrp,
        expectedVersion: versions,
      });
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.version).toBe(versions[0]);
        expect(result.payload).toEqual(samplePayload);
      }
    });

    it('returns the correct version when expectedVersion is omitted', () => {
      const version = 0x00;
      const versioned = new Uint8Array(21);
      versioned[0] = version;
      versioned.set(samplePayload, 1);
      const addr = encodeBase58Check(base58, versioned);

      const result = base58Check(addr, {codec: base58});
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.version).toBe(version);
      }
    });
  });

  describe('error handling', () => {
    it('fails on checksum mismatch', () => {
      const versioned = new Uint8Array(21);
      versioned[0] = 0x00;
      versioned.set(samplePayload, 1);
      const addr = encodeBase58Check(base58, versioned);
      const corrupted =
        addr.slice(0, -1) + (addr.slice(-1) === '1' ? '2' : '1');

      const result = base58Check(corrupted, {codec: base58});
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(Base58CheckErrorCode.CHECKSUM_MISMATCH);
        expect(result.message).toContain('Checksum mismatch');
      }
    });

    it('fails on version mismatch', () => {
      const versioned = new Uint8Array(21);
      versioned[0] = 0x41;
      versioned.set(samplePayload, 1);
      const addr = encodeBase58Check(base58, versioned);

      const result = base58Check(addr, {
        codec: base58,
        expectedVersion: 0x00,
      });
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(Base58CheckErrorCode.VERSION_MISMATCH);
        expect(result.message).toContain('Version mismatch');
      }
    });

    it('fails on invalid Base58 characters', () => {
      const result = base58Check('0OIl', {codec: base58});
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(Base58CheckErrorCode.INVALID_ENCODING);
        expect(result.message).toContain('Invalid Base58 encoding');
      }
    });

    it('fails when decoded data is too short (only checksum)', () => {
      const checksum = sha256(sha256(new Uint8Array(0))).subarray(0, 4);
      const addr = base58.encode(checksum);

      const result = base58Check(addr, {codec: base58});
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.code).toBe(Base58CheckErrorCode.PAYLOAD_TOO_SHORT);
        expect(result.message).toContain('Payload too short');
      }
    });
  });

  describe('edge cases', () => {
    it('works with a payload of minimal size (just version, no extra payload)', () => {
      const versioned = new Uint8Array([0x00]);
      const addr = encodeBase58Check(base58, versioned);
      const result = base58Check(addr, {codec: base58});
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.version).toBe(0x00);
        expect(result.payload.length).toBe(0);
      }
    });

    it('handles leading zeros in the Base58 string correctly', () => {
      const versioned = new Uint8Array([0x00, 0x00, 0x01]);
      const addr = encodeBase58Check(base58, versioned);
      const result = base58Check(addr, {codec: base58});
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.version).toBe(0x00);
        expect(result.payload).toEqual(new Uint8Array([0x00, 0x01]));
      }
    });

    it('accepts both single version and array in options', () => {
      const versioned = new Uint8Array([0x05, 0x44, ...samplePayload]);
      const addr = encodeBase58Check(base58Xrp, versioned);

      const result1 = base58Check(addr, {
        codec: base58Xrp,
        expectedVersion: [0x05, 0x44],
      });
      expect(result1.isValid).toBe(true);

      const singleVersioned = new Uint8Array([0x00, ...samplePayload]);
      const singleAddr = encodeBase58Check(base58, singleVersioned);
      const result2 = base58Check(singleAddr, {
        codec: base58,
        expectedVersion: 0x00,
      });
      expect(result2.isValid).toBe(true);
    });
  });
});
