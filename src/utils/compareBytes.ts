/**
 * Constant‑time comparison of two `Uint8Array` instances.
 *
 * This function resists timing‑attacks because the loop always runs
 * over every byte, accumulating the XOR differences instead of
 * short‑circuiting on the first mismatch.
 *
 * @param a - First byte array.
 * @param b - Second byte array.
 * @returns `true` if the arrays are identical, `false` otherwise.
 */
export function compareBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
