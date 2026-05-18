/**
 * Computes the CRC16-CCITT checksum with two implicit zero‑padding bytes,
 * matching the algorithm used in TON address verification.
 *
 * The input is processed as if it were followed by two `0x00` bytes,
 * exactly as required for TON address payloads, without extra allocations.
 *
 * @param data - The payload to hash.
 * @returns A 2‑byte `Uint8Array` containing the checksum in big‑endian order.
 */
export function crc16(data: Uint8Array): Uint8Array {
  const poly = 0x10_21;
  let crc = 0;

  // Total bytes to process: the actual data plus two zero-padding bytes
  const paddedLength = data.length + 2;

  for (let i = 0; i < paddedLength; i++) {
    // For i beyond the data, feed 0x00 (the implicit padding)
    const byte = i < data.length ? data[i] : 0;

    // Process bits from most significant to least significant
    for (let bit = 0; bit < 8; bit++) {
      const isBitSet = (byte & (1 << (7 - bit))) !== 0;
      crc <<= 1;

      if (isBitSet) {
        crc += 1;
      }

      // Reduce polynomial when the shifted register overflows 16 bits
      if (crc > 0xff_ff) {
        crc &= 0xff_ff;
        crc ^= poly;
      }
    }
  }

  // Extract the two CRC bytes (big-endian order)
  return new Uint8Array([Math.floor(crc / 256), crc % 256]);
}
