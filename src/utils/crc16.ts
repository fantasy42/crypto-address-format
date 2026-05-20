/**
 * Computes the CRC16‑CCITT checksum with two implicit zero‑padding bytes,
 * matching the algorithm used in TON address verification.
 *
 * Returns a 2‑byte `Uint8Array` in big‑endian order.
 */
export function crc16Ton(data: Uint8Array): Uint8Array {
  const poly = 0x1021;
  let crc = 0;

  const paddedLength = data.length + 2;

  for (let i = 0; i < paddedLength; i++) {
    const byte = i < data.length ? data[i] : 0;

    for (let bit = 0; bit < 8; bit++) {
      const isBitSet = (byte & (1 << (7 - bit))) !== 0;
      crc <<= 1;

      if (isBitSet) {
        crc += 1;
      }

      if (crc > 0xffff) {
        crc &= 0xffff;
        crc ^= poly;
      }
    }
  }

  return new Uint8Array([Math.floor(crc / 256), crc % 256]);
}
