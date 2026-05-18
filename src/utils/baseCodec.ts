/**
 * Encoding / decoding interface for a Base‑encoding codec.
 */
export interface BaseCodec {
  encode: (source: Uint8Array | number[] | ArrayBufferView) => string;
  decodeUnsafe: (source: string) => Uint8Array | undefined;
  decode: (source: string) => Uint8Array;
}

/**
 * Creates a Base‑encoding codec for a given alphabet.
 *
 * The returned object converts between arbitrary‑length byte arrays and
 * strings using the specified digit set. Alphabets must not contain
 * duplicate characters, and the first character is used as the
 * representation of a leading zero byte.
 *
 * @param ALPHABET - A string of unique characters defining the encoding.
 * @returns A `BaseCodec` with `encode`, `decodeUnsafe`, and `decode` methods.
 */
export function createBaseCodec(ALPHABET: string): BaseCodec {
  if (ALPHABET.length >= 255) {
    throw new TypeError('Alphabet too long');
  }

  const BASE = ALPHABET.length;
  const LEADER = ALPHABET.charAt(0);
  const FACTOR = Math.log(BASE) / Math.log(256); // bytes → base‑string length ratio
  const iFACTOR = Math.log(256) / Math.log(BASE); // base‑string → bytes length ratio

  // Build a lookup table: character code → digit value (255 = invalid)
  const BASE_MAP = new Uint8Array(256);
  BASE_MAP.fill(255);
  for (let i = 0; i < ALPHABET.length; i++) {
    const code = ALPHABET.charCodeAt(i);
    if (BASE_MAP[code] !== 255) {
      throw new TypeError(`Character '${ALPHABET[i]}' is ambiguous`);
    }
    BASE_MAP[code] = i;
  }

  function encode(source: Uint8Array | number[] | ArrayBufferView): string {
    let src: Uint8Array;
    if (source instanceof Uint8Array) {
      src = source;
    } else if (Array.isArray(source)) {
      src = Uint8Array.from(source);
    } else if (ArrayBuffer.isView(source)) {
      src = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else {
      throw new TypeError('Expected Uint8Array, Buffer, or Array');
    }

    if (src.length === 0) {
      return '';
    }

    // Count leading zero bytes
    let leadingZeros = 0;
    let start = 0;
    while (start < src.length && src[start] === 0) {
      leadingZeros++;
      start++;
    }

    // Allocate a worst‑case buffer for the encoded digits
    const digitCount = ((src.length - start) * iFACTOR + 1) >>> 0;
    const digits = new Uint8Array(digitCount);

    // Convert byte array to base digits (big‑endian)
    let length = 0;
    for (let i = start; i < src.length; i++) {
      let carry = src[i];
      let j = 0;
      for (
        let k = digitCount - 1;
        (carry !== 0 || j < length) && k >= 0;
        k--, j++
      ) {
        carry += (256 * digits[k]) >>> 0;
        digits[k] = (carry % BASE) >>> 0;
        carry = (carry / BASE) >>> 0;
      }
      if (carry !== 0) {
        throw new Error('Non-zero carry');
      }
      length = j;
    }

    // Skip leading zero digits in the encoded buffer
    let firstDigit = digitCount - length;
    while (firstDigit < digitCount && digits[firstDigit] === 0) {
      firstDigit++;
    }

    // Build the final string (leader chars for each zero byte + digits)
    let result = LEADER.repeat(leadingZeros);
    for (let i = firstDigit; i < digitCount; i++) {
      result += ALPHABET.charAt(digits[i]);
    }

    return result;
  }

  function decodeUnsafe(source: string): Uint8Array | undefined {
    if (typeof source !== 'string') {
      throw new TypeError('Expected String');
    }

    if (source.length === 0) {
      return new Uint8Array();
    }

    // Count leading leader characters
    let leadingZeros = 0;
    let pos = 0;
    while (pos < source.length && source[pos] === LEADER) {
      leadingZeros++;
      pos++;
    }

    // Allocate a worst‑case buffer for the decoded bytes
    const byteCount = ((source.length - pos) * FACTOR + 1) >>> 0;
    const bytes = new Uint8Array(byteCount);

    // Convert base string to byte array (big‑endian)
    let length = 0;
    for (; pos < source.length; pos++) {
      const charCode = source.charCodeAt(pos);
      if (charCode > 255) {
        return undefined;
      }

      let carry = BASE_MAP[charCode];
      if (carry === 255) {
        return undefined; // invalid character
      }

      let j = 0;
      for (
        let k = byteCount - 1;
        (carry !== 0 || j < length) && k >= 0;
        k--, j++
      ) {
        carry += (BASE * bytes[k]) >>> 0;
        bytes[k] = (carry % 256) >>> 0;
        carry = (carry / 256) >>> 0;
      }
      if (carry !== 0) {
        throw new Error('Non-zero carry');
      }
      length = j;
    }

    // Skip leading zero bytes in the decoded buffer
    let firstByte = byteCount - length;
    while (firstByte < byteCount && bytes[firstByte] === 0) {
      firstByte++;
    }

    // Combine leading zeroes + decoded payload
    const result = new Uint8Array(leadingZeros + (byteCount - firstByte));
    result.set(bytes.subarray(firstByte), leadingZeros);
    return result;
  }

  function decode(source: string): Uint8Array {
    const buffer = decodeUnsafe(source);
    if (buffer) {
      return buffer;
    }
    throw new Error(`Invalid character in Base${BASE} string`);
  }

  return {encode, decodeUnsafe, decode};
}
