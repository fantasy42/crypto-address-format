import {describe, it, expect} from 'vite-plus/test';

import {crc16Ton, crc16xmodem} from './crc16';

describe('crc16Ton', () => {
  it('returns zero checksum for empty input', () => {
    const result = crc16Ton(new Uint8Array(0));
    expect(result[0]).toBe(0x00);
    expect(result[1]).toBe(0x00);
  });
});

describe('crc16xmodem', () => {
  it('matches standard test vector "123456789"', () => {
    const input = new TextEncoder().encode('123456789');
    const result = crc16xmodem(input);
    expect(result[0]).toBe(0xc3);
    expect(result[1]).toBe(0x31);
  });

  it('returns zero checksum for empty payload', () => {
    const result = crc16xmodem(new Uint8Array(0));
    expect(result[0]).toBe(0x00);
    expect(result[1]).toBe(0x00);
  });
});
