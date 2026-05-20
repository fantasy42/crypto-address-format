import {describe, it, expect} from 'vite-plus/test';

import {encode, decode} from '../base32';

describe('base32 (RFC 4648)', () => {
  describe('valid vectors', () => {
    base32ValidFixtures.forEach(({buf, encoded: encodedList}) => {
      const bytes = new Uint8Array(buf);
      const canonical = encodedList[0];

      it(`encode [${buf.toString()}] → "${canonical}"`, () => {
        expect(encode(bytes)).toBe(canonical);
      });

      encodedList.forEach((str) => {
        it(`decode "${str}"`, () => {
          expect(decode(str)).toEqual(bytes);
        });
      });
    });
  });

  describe('invalid decoding', () => {
    it('throws on invalid character', () => {
      expect(() => decode('AB!')).toThrow('Invalid Base32 character');
    });
  });

  describe('leftover bits', () => {
    it('emits a carry byte for non‑zero leftover bits', () => {
      expect(decode('B')).toEqual(new Uint8Array([0x08]));
    });

    it('empty string decodes to empty buffer', () => {
      expect(decode('')).toEqual(new Uint8Array(0));
    });
  });

  describe('leniency', () => {
    it('strips hyphens before decoding', () => {
      expect(decode('JB-SQ')).toEqual(new Uint8Array([72, 101]));
    });

    it('treats 0 as alias for O and 1 as alias for I', () => {
      expect(decode('R0BBA4AYBM')).toEqual(decode('ROBBA4AYBM'));
      expect(decode('r06a')).toEqual(decode('rO6a'));
      expect(decode('1A')).toEqual(decode('IA'));
    });
  });
});

// Test vectors from the base32.js library (RFC 4648 subset)
const base32ValidFixtures: {buf: number[]; encoded: string[]}[] = [
  {buf: [0], encoded: ['AA', 'aa']},
  {buf: [1], encoded: ['AE']},
  {buf: [2], encoded: ['AI', 'ai', 'aI', 'Ai']},
  {buf: [3], encoded: ['AM', 'am', 'aM', 'Am']},
  {buf: [4], encoded: ['AQ', 'aq', 'aQ', 'Aq']},
  {buf: [5], encoded: ['AU', 'au', 'aU', 'Au']},
  {buf: [6], encoded: ['AY', 'ay', 'aY', 'Ay']},
  {buf: [7], encoded: ['A4', 'a4']},
  {buf: [8], encoded: ['BA', 'ba', 'bA', 'Ba']},
  {buf: [9], encoded: ['BE', 'be', 'bE', 'Be']},
  {buf: [10], encoded: ['BI', 'bi', 'bI', 'Bi']},
  {buf: [11], encoded: ['BM', 'bm', 'bM', 'Bm']},
  {buf: [12], encoded: ['BQ', 'bq', 'bQ', 'Bq']},
  {buf: [13], encoded: ['BU', 'bu', 'bU', 'Bu']},
  {buf: [14], encoded: ['BY', 'by', 'bY', 'By']},
  {buf: [15], encoded: ['B4', 'b4']},
  {buf: [16], encoded: ['CA', 'ca', 'cA', 'Ca']},
  {buf: [17], encoded: ['CE', 'ce', 'cE', 'Ce']},
  {buf: [18], encoded: ['CI', 'ci', 'cI', 'Ci']},
  {buf: [19], encoded: ['CM', 'cm', 'cM', 'Cm']},
  {buf: [20], encoded: ['CQ', 'cq', 'cQ', 'Cq']},
  {buf: [21], encoded: ['CU', 'cu', 'cU', 'Cu']},
  {buf: [22], encoded: ['CY', 'cy', 'cY', 'Cy']},
  {buf: [23], encoded: ['C4', 'c4']},
  {buf: [24], encoded: ['DA', 'da', 'dA', 'Da']},
  {buf: [25], encoded: ['DE', 'de', 'dE', 'De']},
  {buf: [26], encoded: ['DI', 'di', 'dI', 'Di']},
  {buf: [27], encoded: ['DM', 'dm', 'dM', 'Dm']},
  {buf: [28], encoded: ['DQ', 'dq', 'dQ', 'Dq']},
  {buf: [29], encoded: ['DU', 'du', 'dU', 'Du']},
  {buf: [30], encoded: ['DY', 'dy', 'dY', 'Dy']},
  {buf: [31], encoded: ['D4', 'd4']},
  {buf: [0, 0], encoded: ['AAAA', 'aaaa', 'AaAa', 'aAAa']},
  {buf: [1, 0], encoded: ['AEAA', 'aeaa', 'AeAa', 'aEAa']},
  {buf: [0, 1], encoded: ['AAAQ', 'aaaq', 'AaAQ', 'aAAq']},
  {buf: [1, 1], encoded: ['AEAQ', 'aeaq', 'AeAQ', 'aEAq']},
  {buf: [136, 64], encoded: ['RBAA', 'rbaa', 'RbAA', 'rBAa']},
  {buf: [139, 188], encoded: ['RO6A', 'r06a', 'Ro6A', 'r06A']},
  {buf: [54, 31, 127], encoded: ['GYPX6', 'gypx6']},
  {
    buf: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33],
    encoded: ['JBSWY3DPEBLW64TMMQQQ', 'jbswy3dpeblw64tmmqqq'],
  },
  {
    buf: [139, 130, 16, 112, 24, 11, 64],
    encoded: ['ROBBA4AYBNAA', 'robba4aybnaa', 'R0BBA4aybnaa'],
  },
  {
    buf: [139, 130, 16, 112, 24, 11],
    encoded: ['ROBBA4AYBM', 'robba4aybm', 'R0BBA4aybm'],
  },
  {
    buf: [139, 130, 16, 112, 24, 11, 0],
    encoded: ['ROBBA4AYBMAA', 'robba4aybmaa', 'R0BBA4aybmaa'],
  },
];
