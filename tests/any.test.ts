import {describe, it, expect} from 'vite-plus/test';

import {validateAny, validateAnyBatch} from '../src/any';
import {ValidationErrorCodes} from '../src/constants';

const VALID_ETH = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const INVALID_EVM_CHECKSUM = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96046';
const VALID_BTC_BECH32 = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
const VALID_SOL = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV';
const VALID_TRX = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
const VALID_XRP = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
const VALID_LTC_BECH32 = 'ltc1qv43gel3n5hktls3tl0rpz3qrt98t0pavgaec9w';
const VALID_LTC_P2SH = '3LpLGam2zqr9abEhjsW7t99g81Bavt3wY7'; // legacy P2SH, starts with 3
const VALID_XLM = 'GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B';
const VALID_TON_RAW =
  '0:2cf55953e92efbeadab7ba725c3f93a0b23f842cbba72d7b8e6f510a70e422e3';
const VALID_TON_USER = 'EQAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi4wJB';

describe('validateAny', () => {
  describe('positive multi-match', () => {
    it('detects EVM address on Ethereum, BNB, and Polygon', () => {
      const res = validateAny(VALID_ETH);
      expect(res.isValid).toBe(true);
      if (res.isValid) {
        expect(res.chains).toEqual(['Ethereum', 'BNB', 'Polygon']);
        expect(res.address).toBe(VALID_ETH.toLowerCase());
        expect(res.original).toBe(VALID_ETH);
      }
    });

    it('detects legacy P2SH address on both Bitcoin and Litecoin', () => {
      // Because Bitcoin and Litecoin share the same P2SH version byte (0x05),
      // a valid P2SH address is structurally valid on both chains.
      const res = validateAny(VALID_LTC_P2SH);
      expect(res.isValid).toBe(true);
      if (res.isValid) {
        expect(res.chains).toEqual(['Bitcoin', 'Litecoin']);
        expect(res.original).toBe(VALID_LTC_P2SH);
      }
    });
  });

  describe('single-chain matches', () => {
    it('returns Bitcoin for valid bech32', () => {
      const res = validateAny(VALID_BTC_BECH32);
      expect(res.isValid).toBe(true);
      if (res.isValid) {
        expect(res.chains).toEqual(['Bitcoin']);
        expect(res.original).toBe(VALID_BTC_BECH32);
      }
    });

    it('returns Solana for valid base58 address', () => {
      const res = validateAny(VALID_SOL);
      expect(res.isValid).toBe(true);
      if (res.isValid) expect(res.chains).toEqual(['Solana']);
    });

    it('returns TRON for valid TRX address', () => {
      const res = validateAny(VALID_TRX);
      expect(res.isValid).toBe(true);
      if (res.isValid) expect(res.chains).toEqual(['TRON']);
    });

    it('returns XRP for valid classic address', () => {
      const res = validateAny(VALID_XRP);
      expect(res.isValid).toBe(true);
      if (res.isValid) expect(res.chains).toEqual(['XRP']);
    });

    it('returns Litecoin for valid Bech32 (ltc1) address', () => {
      const res = validateAny(VALID_LTC_BECH32);
      expect(res.isValid).toBe(true);
      if (res.isValid) expect(res.chains).toEqual(['Litecoin']);
    });

    it('returns Stellar for valid G… address', () => {
      const res = validateAny(VALID_XLM);
      expect(res.isValid).toBe(true);
      if (res.isValid) expect(res.chains).toEqual(['Stellar']);
    });

    it('returns TON for valid raw address', () => {
      const res = validateAny(VALID_TON_RAW);
      expect(res.isValid).toBe(true);
      if (res.isValid) expect(res.chains).toEqual(['TON']);
    });

    it('returns TON for valid user‑friendly address', () => {
      const res = validateAny(VALID_TON_USER);
      expect(res.isValid).toBe(true);
      if (res.isValid) expect(res.chains).toEqual(['TON']);
    });
  });

  describe('negative - unrecognised format', () => {
    it('returns UNSUPPORTED_TYPE for random string', () => {
      const res = validateAny('random123');
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        expect(res.code).toBe(ValidationErrorCodes.UNSUPPORTED_TYPE);
        expect(res.original).toBe('random123');
      }
    });

    it('returns UNSUPPORTED_TYPE for .eth name', () => {
      const res = validateAny('vitalik.eth');
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        expect(res.code).toBe(ValidationErrorCodes.UNSUPPORTED_TYPE);
        expect(res.original).toBe('vitalik.eth');
      }
    });
  });

  describe('negative - pre-check failures', () => {
    it('handles null/undefined', () => {
      const res = validateAny(null as any);
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        expect(res.code).toBe(ValidationErrorCodes.NULL_OR_UNDEFINED);
        expect(res.original).toBe('');
      }
    });

    it('handles empty string', () => {
      const res = validateAny('   ');
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        expect(res.code).toBe(ValidationErrorCodes.EMPTY);
        expect(res.original).toBe('');
      }
    });

    it('handles too long input', () => {
      const long = '0x' + 'a'.repeat(257);
      const res = validateAny(long);
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        expect(res.code).toBe(ValidationErrorCodes.TOO_LONG);
        expect(res.original).toBe(long.trim());
      }
    });

    it('handles non-ASCII characters', () => {
      const res = validateAny('0x1234\x00abcd');
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        expect(res.code).toBe(ValidationErrorCodes.INVALID_CHARACTERS);
        expect(res.original).toBe('0x1234\x00abcd'.trim());
      }
    });
  });

  describe('negative - matched route but invalid', () => {
    it('returns EVM checksum error for invalid EIP‑55 address', () => {
      const res = validateAny(INVALID_EVM_CHECKSUM);
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        expect(res.code).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
        expect(res.message).toContain('checksum');
        expect(res.original).toBe(INVALID_EVM_CHECKSUM);
      }
    });

    it('returns consistent error for garbage string with 3… prefix', () => {
      // A string that matches the BTC/LTC predicate but fails both validators.
      const res = validateAny('3GarbageAddressThatFailsBoth');
      expect(res.isValid).toBe(false);
      if (!res.isValid) {
        // It must not fall through to UNSUPPORTED_TYPE because the route was matched.
        expect(res.code).not.toBe(ValidationErrorCodes.UNSUPPORTED_TYPE);
        // The first validator (Bitcoin) will reject it; we don’t care about exact code,
        // only that it’s a route‑level failure.
        expect(res.code).toBeDefined();
        expect(res.original).toBe('3GarbageAddressThatFailsBoth');
      }
    });
  });

  describe('cross-chain isolation', () => {
    it('does not misinterpret Solana as Bitcoin or TRON', () => {
      const res = validateAny(VALID_SOL);
      expect(res.isValid).toBe(true);
      if (res.isValid) {
        expect(res.chains).toEqual(['Solana']);
        expect(res.original).toBe(VALID_SOL);
      }
    });
  });
});

describe('validateAnyBatch', () => {
  it('processes a mix of valid and invalid items', () => {
    const results = validateAnyBatch([
      VALID_ETH,
      'garbage',
      {address: VALID_BTC_BECH32, id: 'btc-field'},
      INVALID_EVM_CHECKSUM,
    ]);

    expect(results).toHaveLength(4);

    // ETH
    expect(results[0].isValid).toBe(true);
    if (results[0].isValid) {
      expect(results[0].chains).toContain('Ethereum');
      expect(results[0].index).toBe(0);
      expect(results[0].id).toBeUndefined();
      expect(results[0].original).toBe(VALID_ETH);
    }

    // garbage
    expect(results[1].isValid).toBe(false);
    if (!results[1].isValid) {
      expect(results[1].code).toBe(ValidationErrorCodes.UNSUPPORTED_TYPE);
      expect(results[1].index).toBe(1);
      expect(results[1].original).toBe('garbage');
    }

    // BTC with id
    expect(results[2].isValid).toBe(true);
    if (results[2].isValid) {
      expect(results[2].chains).toEqual(['Bitcoin']);
      expect(results[2].id).toBe('btc-field');
      expect(results[2].original).toBe(VALID_BTC_BECH32);
    }

    // invalid EVM
    expect(results[3].isValid).toBe(false);
    if (!results[3].isValid) {
      expect(results[3].code).toBe(ValidationErrorCodes.INVALID_CHECKSUM);
      expect(results[3].index).toBe(3);
      expect(results[3].original).toBe(INVALID_EVM_CHECKSUM);
    }
  });

  it('handles malformed batch items gracefully', () => {
    const results = validateAnyBatch([
      null,
      undefined,
      {},
      {address: undefined, id: 1},
    ] as any);
    expect(results).toHaveLength(4);
    results.forEach((r) => {
      expect(r.isValid).toBe(false);
      if (!r.isValid) {
        expect(r.code).toBe(ValidationErrorCodes.NULL_OR_UNDEFINED);
        expect(r.original).toBe('');
      }
    });
    expect(results[3].id).toBe(1);
  });
});
