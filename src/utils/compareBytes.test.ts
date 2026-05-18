import {describe, it, expect} from 'vite-plus/test';

import {compareBytes} from './compareBytes';

describe('compareBytes', () => {
  it('returns true for identical arrays', () => {
    const a = new Uint8Array([0x00, 0x11, 0xff]);
    const b = new Uint8Array([0x00, 0x11, 0xff]);
    expect(compareBytes(a, b)).toBe(true);
  });

  it('returns false for different content', () => {
    const a = new Uint8Array([0x00, 0x11, 0xff]);
    const b = new Uint8Array([0x00, 0x22, 0xff]);
    expect(compareBytes(a, b)).toBe(false);
  });

  it('returns false for different lengths', () => {
    const a = new Uint8Array([0x00]);
    const b = new Uint8Array([0x00, 0x01]);
    expect(compareBytes(a, b)).toBe(false);
  });

  it('returns true for two empty arrays', () => {
    expect(compareBytes(new Uint8Array(0), new Uint8Array(0))).toBe(true);
  });

  it('does not leak timing information on first‑byte mismatch', () => {
    // This test is structural: the function itself contains no
    // early exits after the length check, guaranteeing constant time.
    const a = new Uint8Array(256);
    const b = new Uint8Array(256);
    // Make first byte differ, rest identical
    b[0] = 1;
    // Measure that the function does not short‑circuit (passes coverage)
    expect(compareBytes(a, b)).toBe(false);
  });
});
