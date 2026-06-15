import type {ValidationResult} from '../types';

import {base58} from '../utils/base58';
import {base58Check, mapBase58CheckError} from '../utils/base58Check';
import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';
import {ValidationErrorCodes} from '../constants';

/**
 * Supported Tron address categories.
 */
export type TronAddressType = 'TRON';

/**
 * Result returned by `validateTRX()`.
 */
export type TronValidationResult = ValidationResult<TronAddressType>;

/**
 * Validates a TRON mainnet address.
 *
 * Checks the Base58Check encoding, double‑SHA256 checksum, and the `T` prefix
 * (version byte 0x41). The public key hash must be exactly 20 bytes.
 *
 * @param address - The TRON address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateTRX = createValidator<TronValidationResult>(
  (address, {failure, success}) => {
    if (!address.startsWith('T')) {
      return failure({
        code: ValidationErrorCodes.INVALID_PREFIX,
        message: 'Invalid TRON address prefix',
        original: address,
      });
    }

    if (address.length !== 34) {
      return failure({
        code: ValidationErrorCodes.INVALID_LENGTH,
        message: 'Invalid TRON address length',
        original: address,
      });
    }

    const result = base58Check(address, {
      codec: base58,
      expectedVersion: 0x41,
    });

    if (!result.isValid) {
      return failure({
        code: mapBase58CheckError(result.code),
        message: result.message,
        original: address,
      });
    }

    return success({
      type: 'TRON',
      address,
      original: address,
    });
  }
);

/**
 * Validates a batch of TRON mainnet addresses.
 *
 * Wraps `validateTRX`; processes all items and collects results in order.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateTRXBatch = createBatchValidator(validateTRX);

/**
 * Validates a TRC‑20 token address on the TRON network.
 *
 * Alias of `validateTRX` – same format and checksum rules.
 *
 * @param address - The TRC‑20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateTRC20 = validateTRX;

/**
 * Validates a batch of TRC‑20 token addresses on the TRON network.
 *
 * Alias for `validateTRXBatch`.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateTRC20Batch = validateTRXBatch;
