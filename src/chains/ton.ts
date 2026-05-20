import type {ValidationResult} from '../types';

import {crc16Ton} from '../utils/crc16';
import {createValidator} from '../utils/createValidator';

/**
 * Supported TON address categories returned by `validateTON()`.
 */
export type TONAddressType =
  | 'Raw'
  | 'UserFriendly-Bounceable'
  | 'UserFriendly-NonBounceable'
  | 'UserFriendly-Testnet-Bounceable'
  | 'UserFriendly-Testnet-NonBounceable';

/**
 * Result object returned by `validateTON()`.
 *
 * Contains either a validated TON address with its detected type,
 * or an error message if validation fails.
 */
export type TONValidationResult = ValidationResult<TONAddressType>;

const BOUNCEABLE_TAG = 0x11;
const NON_BOUNCEABLE_TAG = 0x51;
const TEST_FLAG = 0x80;

const RAW_REGEXP = /^(-?\d+):([a-fA-F0-9]{64})$/i;
const FRIENDLY_REGEXP = /^[A-Za-z0-9+/_-]{48}$/;

/**
 * Validates a TON (The Open Network) address by checking its format,
 * encoding, and checksum.
 *
 * Supports raw workchain:hex addresses as well as user‑friendly base64(url)
 * addresses across mainnet and testnet. The function returns a typed result
 * object and does not throw on invalid input.
 *
 * @param address - The TON address string to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and,
 * if valid, its detected category (Raw, Bounceable, etc.).
 */
export const validateTON = createValidator<TONValidationResult>(
  (address, context): TONValidationResult => {
    // 1. Raw address (workchain:hex)
    if (address.includes(':')) {
      const match = RAW_REGEXP.exec(address);
      if (!match) {
        return context.failure(
          'Invalid Raw address structure or malformed hex payload'
        );
      }

      const workchainString = match[1];
      const workchain = Number.parseInt(workchainString, 10);

      // Workchain must be a canonical integer (typically 0 or -1)
      if (Number.isNaN(workchain) || String(workchain) !== workchainString) {
        return context.failure('Invalid workchain identifier');
      }

      return context.success('Raw', address);
    }

    // 2. User‑friendly base64 / base64url
    if (FRIENDLY_REGEXP.test(address)) {
      let data: Uint8Array;
      try {
        data = decodeBase64To36Bytes(address);
      } catch {
        return context.failure(
          'Malformed user-friendly base64 encoding payload'
        );
      }

      // 34-byte payload + 2-byte CRC16
      const payload = data.subarray(0, 34);
      const incomingCrc = data.subarray(34, 36);
      const calculatedCrc = crc16Ton(payload);

      if (
        calculatedCrc[0] !== incomingCrc[0] ||
        calculatedCrc[1] !== incomingCrc[1]
      ) {
        return context.failure('Invalid address checksum');
      }

      // Parse tag byte
      let tag = payload[0];
      let isTestOnly = false;

      if (tag & TEST_FLAG) {
        isTestOnly = true;
        tag ^= TEST_FLAG; // Clear test flag bit
      }

      if (tag !== BOUNCEABLE_TAG && tag !== NON_BOUNCEABLE_TAG) {
        return context.failure(
          'Unknown user-friendly address serialization tag'
        );
      }

      const isBounceable = tag === BOUNCEABLE_TAG;

      // Resolve the exact address sub‑type
      let resolvedType: TONAddressType;
      if (isTestOnly) {
        resolvedType = isBounceable
          ? 'UserFriendly-Testnet-Bounceable'
          : 'UserFriendly-Testnet-NonBounceable';
      } else {
        resolvedType = isBounceable
          ? 'UserFriendly-Bounceable'
          : 'UserFriendly-NonBounceable';
      }

      return context.success(resolvedType, address);
    }

    return context.failure('Unsupported TON address format or character set');
  }
);

function decodeBase64To36Bytes(src: string): Uint8Array {
  // Convert URL‑safe alphabet to standard base64
  const normalized = src.replaceAll('-', '+').replaceAll('_', '/');

  const binaryString = atob(normalized);

  if (binaryString.length !== 36) {
    throw new Error('Byte length is not equal to 36');
  }

  return Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
}
