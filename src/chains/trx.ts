import type {ValidationResult} from '../types';

import {base58Check} from '../utils/base58Check';
import {base58Btc} from '../utils/base58';
import {createValidator} from '../utils/createValidator';

/**
 * Supported Tron address categories returned by `validateTRX()`.
 */
export type TronAddressType = 'TRON';

/**
 * Result object returned by `validateTRX()`.
 *
 * Contains either a validated Tron address with its detected type,
 * or an error message if validation fails.
 */
export type TronValidationResult = ValidationResult<TronAddressType>;

/**
 * Validates a TRON mainnet address by checking its Base58Check encoding and prefix.
 *
 * Supports standard TRON addresses starting with the `T` prefix (version 0x41).
 * The function verifies the double-SHA256 checksum to ensure the address
 * has not been corrupted and returns a typed result object.
 *
 * @param address - The TRON address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
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
      codec: base58Btc,
      expectedVersion: 0x41,
    });

    if (!result.isValid) {
      return failure(result.error);
    }

    return success('TRON', address);
  }
);

/**
 * Validates a TRC-20 token address (such as USDT) on the TRON network.
 *
 * Since TRC-20 tokens use the standard TRON address format, this function
 * verifies the Base58Check encoding and the `T` prefix. It ensures the
 * address is a visually and cryptographically valid destination for tokens.
 *
 * @param address - The TRC-20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export const validateTRC20 = validateTRX;
