import {describe, it, expect} from 'vite-plus/test';

import {bech32, bech32m, toWords, fromWordsUnsafe, fromWords} from './bech32';

function testValid(codec: typeof bech32, fixture: (typeof bech32Valid)[0]) {
  it(`encode & decode "${fixture.string}"`, () => {
    const encoded = codec.encode(fixture.prefix, fixture.words);
    expect(encoded).toBe(fixture.string.toLowerCase());

    const decoded = codec.decode(fixture.string);
    expect(decoded.prefix).toBe(fixture.prefix.toLowerCase());
    expect(decoded.words).toEqual(fixture.words);

    const unsafeDecoded = codec.decodeUnsafe(fixture.string);
    expect(unsafeDecoded).toEqual(decoded);
  });
}

function testInvalid(codec: typeof bech32, fixture: (typeof bech32Invalid)[0]) {
  it(`decode fails for "${fixture.string}" with "${fixture.exception}"`, () => {
    const unsafe = codec.decodeUnsafe(fixture.string);
    expect(unsafe).toBeUndefined();

    expect(() => codec.decode(fixture.string)).toThrow(
      new RegExp(fixture.exception)
    );
  });
}

describe('bech32', () => {
  describe('valid vectors', () => {
    bech32Valid.forEach((f) => testValid(bech32, f));
  });

  describe('invalid vectors', () => {
    bech32Invalid.forEach((f) => testInvalid(bech32, f));
  });

  it('rejects mixed case', () => {
    expect(bech32.decodeUnsafe('A12Uel5l')).toBeUndefined();
  });

  it('fails when checksum is wrong', () => {
    // flip a bit in the data part
    const addr = 'A12UEL5L';
    const modified =
      addr.slice(0, 5) + (addr[5] === 'E' ? 'F' : 'E') + addr.slice(6);
    expect(bech32.decodeUnsafe(modified)).toBeUndefined();
  });

  it('toWords / fromWords roundtrip', () => {
    const bytes = new Uint8Array([0, 1, 2, 3, 0xff]);
    const words = toWords(bytes);
    const recovered = fromWords(words);
    expect(recovered).toEqual(Array.from(bytes));
    expect(fromWordsUnsafe(words)).toEqual(Array.from(bytes));
  });
});

describe('bech32m', () => {
  describe('valid vectors', () => {
    bech32mValid.forEach((f) => testValid(bech32m, f));
  });

  describe('invalid vectors', () => {
    bech32mInvalid.forEach((f) => testInvalid(bech32m, f));
  });

  it('rejects a bech32 string when decoded as bech32m', () => {
    expect(
      bech32m.decodeUnsafe('abcdef1qpzry9x8gf2tvdw0s3jn54khce6mua7lmqqqxw')
    ).toBeUndefined();
  });
});

describe('cross‑encoding', () => {
  it('bech32 rejects bech32m addresses and vice versa', () => {
    expect(bech32.decodeUnsafe('A1LQFN3A')).toBeUndefined();
    expect(bech32m.decodeUnsafe('A12UEL5L')).toBeUndefined();
  });
});

describe('fromWordsUnsafe / fromWords', () => {
  it('returns undefined on excess padding', () => {
    const words = [
      14, 20, 15, 7, 13, 26, 0, 25, 18, 6, 11, 13, 8, 21, 4, 20, 3, 17, 2, 29,
      3, 0,
    ];
    expect(fromWordsUnsafe(words)).toBeUndefined();
    expect(() => fromWords(words)).toThrow('Excess padding');
  });

  it('returns undefined on non-zero padding', () => {
    const words = [
      3, 1, 17, 17, 8, 15, 0, 20, 24, 20, 11, 6, 16, 1, 5, 29, 3, 4, 16, 3, 6,
      21, 22, 26, 2, 13, 22, 9, 16, 21, 19, 24, 25, 21, 6, 18, 15, 8, 13, 24,
      24, 24, 25, 9, 12, 1, 4, 16, 6, 9, 17, 1,
    ];
    expect(fromWordsUnsafe(words)).toBeUndefined();
    expect(() => fromWords(words)).toThrow('Non-zero padding');
  });
});

describe('encode throws on invalid input', () => {
  it('throws on non 5‑bit word', () => {
    expect(() => bech32.encode('abc', [128])).toThrow('Non 5-bit word');
  });

  it('throws on invalid prefix characters (space)', () => {
    expect(() => bech32.encode('ab c', [0])).toThrow('Invalid prefix');
  });

  it('throws when the total length exceeds the limit', () => {
    const longPrefix = 'a'.repeat(84); // prefix.length + 7 + 1 = 92 > default 90
    expect(() => bech32.encode(longPrefix, [])).toThrow('Exceeds length limit');
  });

  it('respects a custom limit', () => {
    expect(() => bech32.encode('abc', [0, 1, 2], 11)).toThrow(
      'Exceeds length limit'
    );
  });
});

// Official BIP173 valid/invalid bech32 test vectors
const bech32Valid = [
  {
    string: 'A12UEL5L',
    prefix: 'A',
    words: [],
  },
  {
    string:
      'an83characterlonghumanreadablepartthatcontainsthenumber1andtheexcludedcharactersbio1tt5tgs',
    prefix:
      'an83characterlonghumanreadablepartthatcontainsthenumber1andtheexcludedcharactersbio',
    words: [],
  },
  {
    string: 'abcdef1qpzry9x8gf2tvdw0s3jn54khce6mua7lmqqqxw',
    prefix: 'abcdef',
    words: [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    ],
  },
];

const bech32Invalid = [
  {
    string: 'A12Uel5l',
    exception: 'Mixed-case string',
  },
  {
    string: ' 1nwldj5',
    exception: 'Invalid prefix',
  },
  {
    string: 'abc1rzg',
    exception: 'too short',
  },
  {
    string: 'x1b4n0q5v',
    exception: 'Unknown character',
  },
  {
    string: '1pzry9x0s0muk',
    exception: 'Missing prefix',
  },
  {
    string: 'pzry9x0s0muk',
    exception: 'No separator character',
  },
  {
    string: 'abc1rzgt4',
    exception: 'Data too short',
  },
];

// Official BIP350 valid/invalid bech32m test vectors
const bech32mValid = [
  {
    string: 'A1LQFN3A',
    prefix: 'A',
    words: [],
  },
  {
    string: 'abcdef1l7aum6echk45nj3s0wdvt2fg8x9yrzpqzd3ryx',
    prefix: 'abcdef',
    words: [
      31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14,
      13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0,
    ],
  },
];

const bech32mInvalid = [
  {
    string: 'A1LQfN3A',
    exception: 'Mixed-case string',
  },
  {
    string: 'qyrz8wqd2c9m',
    exception: 'No separator character',
  },
  {
    string: 'M1VUXWEZ',
    exception: 'Invalid checksum',
  },
];
