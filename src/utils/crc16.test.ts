import {describe, it, expect} from 'vite-plus/test';

import {crc16Ton} from './crc16';

describe('crc16Ton', () => {
  it('matches the standard numeric test vector', () => {
    const input = new TextEncoder().encode('123456789');
    const result = crc16Ton(input);

    expect(result[0]).toBe(0x31);
    expect(result[1]).toBe(0xc3);
  });

  it('returns zero checksum for empty input', () => {
    const result = crc16Ton(new Uint8Array(0));
    expect(result[0]).toBe(0x00);
    expect(result[1]).toBe(0x00);
  });
});
