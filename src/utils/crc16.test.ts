import {describe, it, expect} from 'vite-plus/test';

import {crc16} from './crc16';

describe('crc16', () => {
  describe('positive cases', () => {
    it('should match the standard numeric test vector', () => {
      const input = new TextEncoder().encode('123456789');
      const result = crc16(input);

      expect(result instanceof Uint8Array).toBe(true);
      expect(result[0]).toBe(0x31);
      expect(result[1]).toBe(0xc3);
    });

    it('should correctly compute checksums for empty byte arrays', () => {
      const input = new Uint8Array(0);
      const result = crc16(input);

      expect(result[0]).toBe(0x00);
      expect(result[1]).toBe(0x00);
    });
  });
});
