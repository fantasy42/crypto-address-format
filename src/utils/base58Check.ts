import type {BaseCodec} from './baseCodec';

import {sha256} from '@noble/hashes/sha2.js';

import {compareBytes} from './compareBytes';

type Base58CheckResult =
  | {
      isValid: true;
      version: number;
      payload: Uint8Array;
    }
  | {
      isValid: false;
      error: string;
    };

interface Base58CheckOptions {
  codec: BaseCodec;
  expectedVersion?: number | number[];
}

export function base58Check(
  address: string,
  options: Base58CheckOptions
): Base58CheckResult {
  try {
    const {codec, expectedVersion} = options;

    const decoded = codec.decode(address);
    if (decoded.length < 5) {
      return {isValid: false, error: 'Payload too short'};
    }

    const data = decoded.subarray(0, -4);
    const checksum = decoded.subarray(-4);

    const expectedChecksum = sha256(sha256(data)).subarray(0, 4);

    if (!compareBytes(checksum, expectedChecksum)) {
      return {isValid: false, error: 'Checksum mismatch'};
    }

    const versions =
      expectedVersion !== undefined
        ? Array.isArray(expectedVersion)
          ? expectedVersion
          : [expectedVersion]
        : [decoded[0]];

    const versionsLength = versions.length;
    const actualVersion = decoded.subarray(0, versionsLength);

    if (expectedVersion !== undefined) {
      const expectedBuffer = new Uint8Array(versions);

      if (!compareBytes(actualVersion, expectedBuffer)) {
        return {isValid: false, error: 'Version mismatch'};
      }
    }

    return {
      isValid: true,
      version: actualVersion[0],
      payload: decoded.subarray(versionsLength, -4),
    };
  } catch {
    return {isValid: false, error: 'Invalid Base58 encoding'};
  }
}
