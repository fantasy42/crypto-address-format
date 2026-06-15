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
        return failure({
          code: ValidationErrorCodes.INVALID_LENGTH,
          message: 'Invalid Classic address length',
          original: address,
        });
      }

      const res = base58Check(address, {
        codec: base58Xrp,
        expectedVersion: 0x00,
      });

      if (!res.isValid) {
        return failure({
          code: mapBase58CheckError(res.code),
          message: res.message,
          original: address,
        });
      }

      if (res.payload.length !== 20) {
        return failure({
          code: ValidationErrorCodes.INVALID_LENGTH,
          message: 'Invalid Classic address payload',
          original: address,
        });
      }

      return success({
        type: 'Classic',
        address,
        original: address,
      });
    }

    if (address.startsWith('X')) {
      if (address.length < 29 || address.length > 59) {
        return failure({
          code: ValidationErrorCodes.INVALID_LENGTH,
          message: 'Invalid X-Address string length',
          original: address,
        });
      }

      const res = base58Check(address, {
        codec: base58Xrp,
        expectedVersion: [0x05, 0x44],
      });

      if (!res.isValid) {
        return failure({
          code: mapBase58CheckError(res.code),
          message: res.message,
          original: address,
        });
      }

      if (res.payload.length !== 29) {
        return failure({
          code: ValidationErrorCodes.INVALID_LENGTH,
          message: 'Invalid X-Address payload structure',
          original: address,
        });
      }

      return success({
        type: 'X-Address-Mainnet',
        address,
        original: address,
      });
    }

    return failure({
      code: ValidationErrorCodes.INVALID_PREFIX,
      message: 'Unsupported XRP address prefix',
      original: address,
    });
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
