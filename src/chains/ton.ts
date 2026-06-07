import type {ValidationResult} from '../types';

import {crc16Ton} from '../utils/crc16';
import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';

/**
 * Supported TON address categories.
 */
export type TONAddressType =
  | 'Raw'
  | 'UserFriendly-Bounceable'
  | 'UserFriendly-NonBounceable'
  | 'UserFriendly-Testnet-Bounceable'
  | 'UserFriendly-Testnet-NonBounceable';

/**
 * Result returned by `validateTON()`.
 */
export type TONValidationResult = ValidationResult<TONAddressType>;

const BOUNCEABLE_TAG = 0x11;
const NON_BOUNCEABLE_TAG = 0x51;
const TEST_FLAG = 0x80;

const RAW_REGEXP = /^(-?\d+):([a-fA-F0-9]{64})$/i;
const FRIENDLY_REGEXP = /^[A-Za-z0-9+/_-]{48}$/;

/**
 * Validates a TON (The Open Network) address.
 *
 * Supports raw workchain:hex addresses as well as user‑friendly base64(url)
 * addresses across mainnet and testnet. The function verifies encoding,
 * checksum, and address tag.
 *
 * @param address - The TON address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateTON = createValidator<TONValidationResult>(
  (address, context): TONValidationResult => {
    if (address.includes(':')) {
      const match = RAW_REGEXP.exec(address);
      if (!match) {
        return context.failure(
          'Invalid Raw address structure or malformed hex payload'
        );
      }

      const workchainString = match[1];
      const workchain = Number.parseInt(workchainString, 10);

      if (Number.isNaN(workchain) || String(workchain) !== workchainString) {
        return context.failure('Invalid workchain identifier');
      }

      return context.success('Raw', address);
    }

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

      let tag = payload[0];
      let isTestOnly = false;

      if (tag & TEST_FLAG) {
        isTestOnly = true;
        tag ^= TEST_FLAG;
      }

      if (tag !== BOUNCEABLE_TAG && tag !== NON_BOUNCEABLE_TAG) {
        return context.failure(
          'Unknown user-friendly address serialization tag'
        );
      }

      const isBounceable = tag === BOUNCEABLE_TAG;

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

/**
 * Validates a batch of TON addresses.
 *
 * Wraps `validateTON`; processes all items and collects results in order.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateTONBatch = createBatchValidator(validateTON);

function decodeBase64To36Bytes(src: string): Uint8Array {
  const normalized = src.replaceAll('-', '+').replaceAll('_', '/');

  const binaryString = atob(normalized);

  if (binaryString.length !== 36) {
    throw new Error('Byte length is not equal to 36');
  }

  return Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
}
