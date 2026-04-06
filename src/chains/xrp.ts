import type {ValidationResult} from '../types';

import {base58Xrp} from '../utils/base58';
import {base58Check} from '../utils/base58Check';
import {createValidator} from '../utils/createValidator';

/**
 * Supported XRP Ledger address categories returned by `validateXRP()`.
 */
export type XRPAddressType = 'Classic' | 'X-Address-Mainnet';

/**
 * Result object returned by `validateXRP()`.
 *
 * Contains either a validated XRP address with its detected type,
 * or an error message if validation fails.
 */
export type XRPValidationResult = ValidationResult<XRPAddressType>;

/**
 * Validates an XRP Ledger address by checking its encoding, prefix, and checksum.
 *
 * Supports standard Base58 Classic addresses (starting with 'r') and
 * X-Addresses (starting with 'X') for Mainnet. The function verifies the
 * double-SHA256 checksum and network-specific version bytes, returning a
 * typed result object without throwing on invalid input.
 *
 * @param address - The XRP address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and,
 * if valid, its detected address type (Classic or X-Address-Mainnet).
 */
export const validateXRP = createValidator<XRPValidationResult>(
  (address, {failure, success}) => {
    if (address.startsWith('r')) {
      if (address.length < 25 || address.length > 35) {
        return failure('Invalid Classic address length');
      }

      const res = base58Check(address, {
        codec: base58Xrp,
        expectedVersion: 0x00,
      });

      if (!res.isValid) {
        return failure(res.error);
      }

      // Classic payload is exactly 20 bytes (AccountID)
      if (res.payload.length !== 20) {
        return failure('Invalid Classic address payload');
      }

      return success('Classic', address);
    }

    // Mainnet X-Address (Tagged Address)
    if (address.startsWith('X')) {
      if (address.length < 29 || address.length > 59) {
        return failure('Invalid X-Address string length');
      }

      const res = base58Check(address, {
        codec: base58Xrp,
        expectedVersion: [0x05, 0x44],
      });

      if (!res.isValid) {
        return failure(res.error);
      }

      /**
       * X-Address payload structure:
       * [20b AccountID] + [1b Flag] + [8b Tag/Reserved] = 29 bytes
       */
      if (res.payload.length !== 29) {
        return failure('Invalid X-Address payload structure');
      }

      return success('X-Address-Mainnet', address);
    }

    return failure('Unsupported XRP address prefix');
  }
);
