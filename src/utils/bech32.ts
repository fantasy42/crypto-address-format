const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

const ALPHABET_MAP: {[key: string]: number} = {};
for (let i = 0; i < ALPHABET.length; i++) {
  const char = ALPHABET.charAt(i);
  ALPHABET_MAP[char] = i;
}

/**
 * Returned by a successful `decode` / `decodeUnsafe` call.
 */
export interface Decoded {
  prefix: string;
  words: number[];
}

/**
 * Public interface of a Bech32 / Bech32m codec instance.
 */
export interface BechLib {
  decodeUnsafe: (str: string, limit?: number) => Decoded | undefined;
  decode: (str: string, limit?: number) => Decoded;
  encode: (prefix: string, words: ArrayLike<number>, limit?: number) => string;
  toWords: (bytes: ArrayLike<number>) => number[];
  fromWordsUnsafe: (words: ArrayLike<number>) => number[] | undefined;
  fromWords: (words: ArrayLike<number>) => number[];
}

/** Single step of the Bech32 polynomial checksum. */
function polymodStep(value: number): number {
  const b = value >> 25;
  return (
    ((value & 0x1ffffff) << 5) ^
    (-((b >> 0) & 1) & 0x3b6a57b2) ^
    (-((b >> 1) & 1) & 0x26508e6d) ^
    (-((b >> 2) & 1) & 0x1ea119fa) ^
    (-((b >> 3) & 1) & 0x3d4233dd) ^
    (-((b >> 4) & 1) & 0x2a1462b3)
  );
}

/** Compute the checksum prefix contribution from a human‑readable part. */
function prefixChecksum(prefix: string): number | string {
  let chk = 1;
  for (let i = 0; i < prefix.length; ++i) {
    const c = prefix.charCodeAt(i);
    if (c < 33 || c > 126) {
      return 'Invalid prefix (' + prefix + ')';
    }

    chk = polymodStep(chk) ^ (c >> 5);
  }
  chk = polymodStep(chk);

  for (let i = 0; i < prefix.length; ++i) {
    const v = prefix.charCodeAt(i);
    chk = polymodStep(chk) ^ (v & 0x1f);
  }
  return chk;
}

/**
 * Convert between power-of-two bases without padding validation.
 *
 * @param data       - Input digits.
 * @param inBits     - Number of bits per input digit.
 * @param outBits    - Number of bits per output digit.
 * @param pad        - If `true`, the output is padded to the next full group.
 *                     If `false`, the function checks that there is no excess or
 *                     non‑zero padding and returns a string error instead.
 */
function convert(
  data: ArrayLike<number>,
  inBits: number,
  outBits: number,
  pad: true
): number[];
function convert(
  data: ArrayLike<number>,
  inBits: number,
  outBits: number,
  pad: false
): number[] | string;
function convert(
  data: ArrayLike<number>,
  inBits: number,
  outBits: number,
  pad: boolean
): number[] | string {
  let value = 0;
  let bits = 0;
  const maxV = (1 << outBits) - 1;

  const result: number[] = [];
  for (let i = 0; i < data.length; ++i) {
    value = (value << inBits) | data[i];
    bits += inBits;

    while (bits >= outBits) {
      bits -= outBits;
      result.push((value >> bits) & maxV);
    }
  }

  if (pad) {
    if (bits > 0) {
      result.push((value << (outBits - bits)) & maxV);
    }
  } else {
    if (bits >= inBits) {
      return 'Excess padding';
    }
    if ((value << (outBits - bits)) & maxV) {
      return 'Non-zero padding';
    }
  }

  return result;
}

/**
 * Convert an array of bytes (8‑bit) to an array of 5‑bit words.
 * This is the standard step before encoding a payload.
 */
export function toWords(bytes: ArrayLike<number>): number[] {
  return convert(bytes, 8, 5, true);
}

/**
 * Convert an array of 5‑bit words back to bytes.
 * Returns `undefined` when the padding is invalid.
 */
export function fromWordsUnsafe(
  words: ArrayLike<number>
): number[] | undefined {
  const res = convert(words, 5, 8, false);
  if (Array.isArray(res)) {
    return res;
  }
}

/**
 * Same as `fromWordsUnsafe` but throws on invalid padding.
 */
export function fromWords(words: ArrayLike<number>): number[] {
  const res = convert(words, 5, 8, false);
  if (Array.isArray(res)) {
    return res;
  }
  throw new Error(res);
}

/**
 * Creates a Bech32 or Bech32m codec.
 *
 * @param encoding - Either `'bech32'` (BIP173) or `'bech32m'` (BIP350).
 * @returns An object with `encode`, `decode`, `decodeUnsafe`, `toWords`,
 *          `fromWordsUnsafe`, and `fromWords`.
 */
function createBechLib(encoding: 'bech32' | 'bech32m'): BechLib {
  const ENCODING_CONST = encoding === 'bech32' ? 1 : 0x2bc830a3;

  function encode(
    prefix: string,
    words: ArrayLike<number>,
    limit: number = 90
  ): string {
    if (prefix.length + 7 + words.length > limit) {
      throw new TypeError('Exceeds length limit');
    }

    prefix = prefix.toLowerCase();

    let chk = prefixChecksum(prefix);
    if (typeof chk === 'string') {
      throw new Error(chk);
    }

    let result = prefix + '1';
    for (let i = 0; i < words.length; ++i) {
      const x = words[i];
      if (x >> 5 !== 0) {
        throw new Error('Non 5-bit word');
      }

      chk = polymodStep(chk) ^ x;
      result += ALPHABET.charAt(x);
    }

    for (let i = 0; i < 6; ++i) {
      chk = polymodStep(chk);
    }
    chk ^= ENCODING_CONST;

    for (let i = 0; i < 6; ++i) {
      const v = (chk >> ((5 - i) * 5)) & 0x1f;
      result += ALPHABET.charAt(v);
    }

    return result;
  }

  function decodeInternal(str: string, limit: number = 90): Decoded | string {
    if (str.length < 8) {
      return str + ' too short';
    }
    if (str.length > limit) {
      return 'Exceeds length limit';
    }

    const lowered = str.toLowerCase();
    const uppered = str.toUpperCase();
    if (str !== lowered && str !== uppered) {
      return 'Mixed-case string ' + str;
    }
    str = lowered;

    const split = str.lastIndexOf('1');
    if (split === -1) {
      return 'No separator character for ' + str;
    }
    if (split === 0) {
      return 'Missing prefix for ' + str;
    }

    const prefix = str.slice(0, split);
    const wordChars = str.slice(split + 1);
    if (wordChars.length < 6) {
      return 'Data too short';
    }

    let chk = prefixChecksum(prefix);
    if (typeof chk === 'string') {
      return chk;
    }

    const words: number[] = [];
    for (let i = 0; i < wordChars.length; ++i) {
      const c = wordChars.charAt(i);
      const v = ALPHABET_MAP[c];
      if (v === undefined) {
        return 'Unknown character ' + c;
      }
      chk = polymodStep(chk) ^ v;

      // Skip the checksum part
      if (i + 6 >= wordChars.length) {
        continue;
      }
      words.push(v);
    }

    if (chk !== ENCODING_CONST) {
      return 'Invalid checksum for ' + str;
    }
    return {prefix, words};
  }

  function decodeUnsafe(str: string, limit?: number): Decoded | undefined {
    const res = decodeInternal(str, limit);
    if (typeof res === 'object') {
      return res;
    }
  }

  function decode(str: string, limit?: number): Decoded {
    const res = decodeInternal(str, limit);
    if (typeof res === 'object') {
      return res;
    }
    throw new Error(res);
  }

  return {
    decodeUnsafe,
    decode,
    encode,
    toWords,
    fromWordsUnsafe,
    fromWords,
  };
}

/**
 * Standard Bech32 codec (BIP173 – SegWit v0).
 */
export const bech32 = createBechLib('bech32');

/**
 * Bech32m codec (BIP350 – SegWit v1+ / Taproot).
 */
export const bech32m = createBechLib('bech32m');
