import type {ValidationResult} from '../types';

import {base58Xrp} from '../utils/base58';
import {base58Check, mapBase58CheckError} from '../utils/base58Check';
import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';
import {ValidationErrorCodes} from '../constants';

/**
 * Supported XRP Ledger address categories.
 */
export type XRPAddressType = 'Classic' | 'X-Address-Mainnet';

/**
 * Result returned by `validateXRP()`.
 */
export type XRPValidationResult = ValidationResult<XRPAddressType>;

/**
 * Validates an XRP Ledger address.
 *
 * Supports standard Base58 Classic addresses (starting with 'r') and
 * X‑Addresses (starting with 'X') for Mainnet. Verifies double‑SHA256 checksum
 * and network‑specific version bytes.
 *
 * @param address - The XRP address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateXRP = createValidator<XRPValidationResult>(
  (address, {failure, success}) => {
    if (address.startsWith('r')) {
      if (address.length < 25 || address.length > 35) {
        return failure(
          ValidationErrorCodes.INVALID_LENGTH,
          'Invalid Classic address length'
        );
      }

      const res = base58Check(address, {
        codec: base58Xrp,
        expectedVersion: 0x00,
      });

      if (!res.isValid) {
        return failure(mapBase58CheckError(res.code), res.message);
      }

      if (res.payload.length !== 20) {
        return failure(
          ValidationErrorCodes.INVALID_LENGTH,
          'Invalid Classic address payload'
        );
      }

      return success('Classic', address);
    }

    if (address.startsWith('X')) {
      if (address.length < 29 || address.length > 59) {
        return failure(
          ValidationErrorCodes.INVALID_LENGTH,
          'Invalid X-Address string length'
        );
      }

      const res = base58Check(address, {
        codec: base58Xrp,
        expectedVersion: [0x05, 0x44],
      });

      if (!res.isValid) {
        return failure(mapBase58CheckError(res.code), res.message);
      }

      if (res.payload.length !== 29) {
        return failure(
          ValidationErrorCodes.INVALID_LENGTH,
          'Invalid X-Address payload structure'
        );
      }

      return success('X-Address-Mainnet', address);
    }

    return failure(
      ValidationErrorCodes.INVALID_PREFIX,
      'Unsupported XRP address prefix'
    );
  }
);

/**
 * Validates a batch of XRP Ledger addresses.
 *
 * Wraps `validateXRP`; processes all items and collects results in order.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateXRPBatch = createBatchValidator(validateXRP);
