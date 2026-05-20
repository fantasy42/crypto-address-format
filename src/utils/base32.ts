const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BITS_PER_CHAR = 5;
const MASK = 0x1f;

// Reverse lookup map with aliases 0 → O (14) and 1 → I (8)
const REVERSE_MAP: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) {
  REVERSE_MAP[ALPHABET[i]] = i;
}
REVERSE_MAP['0'] = REVERSE_MAP['O'];
REVERSE_MAP['1'] = REVERSE_MAP['I'];

/**
 * Decodes a Base32 string (RFC 4648) into a Uint8Array.
 *
 * Accepts upper/lower case, optional hyphens, and aliases '0'→'O', '1'→'I'.
 * Leftover padding bits are emitted as a final byte (base32.js library behaviour).
 *
 * @throws {Error} on invalid characters
 */
export function decode(base32Str: string): Uint8Array {
  const cleaned = base32Str.replace(/-/g, '').toUpperCase();
  const maxLength = Math.ceil((cleaned.length * BITS_PER_CHAR) / 8);
  const result = new Uint8Array(maxLength);

  let bits = 0;
  let value = 0;
  let index = 0;

  for (const char of cleaned) {
    const val = REVERSE_MAP[char];
    if (val === undefined) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
    value = (value << BITS_PER_CHAR) | val;
    bits += BITS_PER_CHAR;

    while (bits >= 8) {
      bits -= 8;
      result[index++] = (value >>> bits) & 0xff;
      value &= (1 << bits) - 1; // keep only the remaining lower bits
    }
  }

  // Emit non‑zero carry
  if (bits > 0 && value !== 0) {
    result[index++] = (value << (8 - bits)) & 0xff;
  }

  return result.subarray(0, index);
}

/**
 * Encodes a Uint8Array into an uppercase Base32 string (RFC 4648, no padding).
 */
export function encode(data: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of data) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= BITS_PER_CHAR) {
      bits -= BITS_PER_CHAR;
      output += ALPHABET[(value >>> bits) & MASK];
    }
  }

  if (bits > 0) {
    output += ALPHABET[(value << (BITS_PER_CHAR - bits)) & MASK];
  }

  return output;
}
