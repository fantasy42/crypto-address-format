import {sha256} from '@noble/hashes/sha2.js';

import base58 from './base58';
import {compareBytes} from './compareBytes';

export interface Base58CheckResult {
  isValid: boolean;
  version?: number;
  payload?: Uint8Array;
  error?: string;
}

export function base58Check(
  address: string,
  expectedVersion?: number
): Base58CheckResult {
  try {
    const decoded = base58.decode(address);
    if (decoded.length < 5) {
      return {isValid: false, error: 'Payload too short'};
    }

    const data = decoded.subarray(0, -4);
    const checksum = decoded.subarray(-4);

    const firstHash = sha256(data);
    const secondHash = sha256(firstHash);
    const expectedChecksum = secondHash.slice(0, 4);

    if (!compareBytes(checksum, expectedChecksum)) {
      return {isValid: false, error: 'Checksum mismatch'};
    }

    const version = decoded[0];
    if (expectedVersion !== undefined && version !== expectedVersion) {
      const got = version.toString(16).padStart(2, '0');
      const expected = expectedVersion.toString(16).padStart(2, '0');

      return {
        isValid: false,
        error: `Address version mismatch: expected 0x${expected}, got 0x${got}`,
      };
    }

    return {
      isValid: true,
      version,
      payload: decoded.subarray(1, -4),
    };
  } catch {
    return {isValid: false, error: 'Invalid Base58 encoding'};
  }
}
