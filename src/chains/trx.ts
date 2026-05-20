import type {ValidationResult} from '../types';

import {base58} from '../utils/base58';
import {base58Check} from '../utils/base58Check';
import {createValidator} from '../utils/createValidator';

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
      return failure('Invalid TRON address prefix');
    }

    if (address.length !== 34) {
      return failure('Invalid TRON address length');
    }

    const result = base58Check(address, {
      codec: base58,
      expectedVersion: 0x41,
    });

    if (!result.isValid) {
      return failure(result.error);
    }

    return success('TRON', address);
  }
);

/**
 * Validates a TRC‑20 token address on the TRON network.
 *
 * Alias of `validateTRX` – same format and checksum rules.
 *
 * @param address - The TRC‑20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateTRC20 = validateTRX;
