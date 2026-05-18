import type {BaseCodec} from './baseCodec';

import {sha256} from '@noble/hashes/sha2.js';

import {compareBytes} from './compareBytes';

/**
 * Possible result of a Base58Check validation.
 *
 * On success, provides the decoded payload, the leading version byte(s),
 * and a confirmation flag. On failure, it returns a descriptive error.
 */
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

/**
 * Options for {@link base58Check}.
 *
 * @property codec - The Base‑encoding codec to use (e.g. `base58Btc`).
 * @property expectedVersion - Optional single version byte or an array of
 * version bytes that the decoded data must start with. If omitted, no
 * version check is performed but the first byte is still returned as
 * `version`.
 */
interface Base58CheckOptions {
  codec: BaseCodec;
  expectedVersion?: number | number[];
}

/**
 * Validates a Base58Check‑encoded address and extracts its payload.
 *
 * The function decodes the input string with the supplied `codec`,
 * verifies the trailing 4‑byte double‑SHA256 checksum, optionally
 * checks the leading version bytes, and returns the payload together
 * with the parsed version. It never throws – all errors are
 * captured in the returned object.
 *
 * @param address  - The Base58Check string to validate.
 * @param options  - Codec and optional version constraint.
 * @returns A {@link Base58CheckResult} indicating success or failure.
 */
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

    // Separate version+payload from the trailing checksum
    const versionAndPayload = decoded.subarray(0, -4);
    const checksum = decoded.subarray(-4);

    const expectedChecksum = sha256(sha256(versionAndPayload)).subarray(0, 4);

    if (!compareBytes(checksum, expectedChecksum)) {
      return {isValid: false, error: 'Checksum mismatch'};
    }

    // Determine which bytes are the version prefix
    const versionBytes =
      expectedVersion !== undefined
        ? Array.isArray(expectedVersion)
          ? expectedVersion
          : [expectedVersion]
        : [decoded[0]]; // default: single leading byte is the version

    const versionLength = versionBytes.length;
    const actualVersion = versionAndPayload.subarray(0, versionLength);

    if (expectedVersion !== undefined) {
      const expectedBuffer = new Uint8Array(versionBytes);

      if (!compareBytes(actualVersion, expectedBuffer)) {
        return {isValid: false, error: 'Version mismatch'};
      }
    }

    return {
      isValid: true,
      version: actualVersion[0], // single‑byte version for convenience
      payload: versionAndPayload.subarray(versionLength), // the remaining payload
    };
  } catch {
    return {isValid: false, error: 'Invalid Base58 encoding'};
  }
}
