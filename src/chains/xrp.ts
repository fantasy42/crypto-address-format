import type {ValidationResult} from '../types';

import {base58Xrp} from '../utils/base58';
import {base58Check} from '../utils/base58Check';
import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';

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
        return failure('Invalid Classic address length');
      }

      const res = base58Check(address, {
        codec: base58Xrp,
        expectedVersion: 0x00,
      });

      if (!res.isValid) {
        return failure(res.error);
      }

      if (res.payload.length !== 20) {
        return failure('Invalid Classic address payload');
      }

      return success('Classic', address);
    }

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

      if (res.payload.length !== 29) {
        return failure('Invalid X-Address payload structure');
      }

      return success('X-Address-Mainnet', address);
    }

    return failure('Unsupported XRP address prefix');
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
