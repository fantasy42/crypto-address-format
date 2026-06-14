import type {ValidationErrorCode} from '../types';
import type {BaseCodec} from './baseCodec';

import {sha256} from '@noble/hashes/sha2.js';

import {compareBytes} from './compareBytes';
import {ValidationErrorCodes} from '../constants';

export const Base58CheckErrorCode = {
  /** Decoded data is too short to contain a checksum. */
  PAYLOAD_TOO_SHORT: 'PAYLOAD_TOO_SHORT',
  /** The 4‑byte double‑SHA256 checksum does not match. */
  CHECKSUM_MISMATCH: 'CHECKSUM_MISMATCH',
  /** The leading version byte(s) do not match the expected value(s). */
  VERSION_MISMATCH: 'VERSION_MISMATCH',
  /** The string could not be decoded as Base58. */
  INVALID_ENCODING: 'INVALID_ENCODING',
} as const;

export type Base58CheckErrorCode =
  (typeof Base58CheckErrorCode)[keyof typeof Base58CheckErrorCode];

/**
 * Maps a low‑level Base58Check error code to a public,
 * chain‑agnostic `ValidationErrorCode`.
 *
 * @param code - The internal error code from `base58Check`.
 * @returns A matching public error code suitable for end‑user display.
 */
export function mapBase58CheckError(
  code: Base58CheckErrorCode
): ValidationErrorCode {
  switch (code) {
    case Base58CheckErrorCode.CHECKSUM_MISMATCH:
      return ValidationErrorCodes.INVALID_CHECKSUM;
    case Base58CheckErrorCode.PAYLOAD_TOO_SHORT:
      return ValidationErrorCodes.INVALID_LENGTH;
    case Base58CheckErrorCode.VERSION_MISMATCH:
      return ValidationErrorCodes.INVALID_VERSION;
    default:
      return ValidationErrorCodes.INVALID_ENCODING;
  }
}

/**
 * Possible result of a Base58Check validation.
 *
 * On success, provides the decoded payload, the leading version byte(s),
 * and a confirmation flag. On failure, it returns an internal error code
 * and a human‑readable message.
 */
type Base58CheckResult =
  | {isValid: true; version: number; payload: Uint8Array}
  | {isValid: false; code: Base58CheckErrorCode; message: string};

/**
 * Options for {@link base58Check}.
 *
 * @property codec - The Base‑encoding codec to use (e.g. `base58`).
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
      return {
        isValid: false,
        code: Base58CheckErrorCode.PAYLOAD_TOO_SHORT,
        message: 'Payload too short',
      };
    }

    // Separate version+payload from the trailing checksum
    const versionAndPayload = decoded.subarray(0, -4);
    const checksum = decoded.subarray(-4);

    const expectedChecksum = sha256(sha256(versionAndPayload)).subarray(0, 4);

    if (!compareBytes(checksum, expectedChecksum)) {
      return {
        isValid: false,
        code: Base58CheckErrorCode.CHECKSUM_MISMATCH,
        message: 'Checksum mismatch',
      };
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
        return {
          isValid: false,
          code: Base58CheckErrorCode.VERSION_MISMATCH,
          message: 'Version mismatch',
        };
      }
    }

    return {
      isValid: true,
      version: actualVersion[0], // single‑byte version for convenience
      payload: versionAndPayload.subarray(versionLength), // the remaining payload
    };
  } catch {
    return {
      isValid: false,
      code: Base58CheckErrorCode.INVALID_ENCODING,
      message: 'Invalid Base58 encoding',
    };
  }
}
