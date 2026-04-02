import type {TronAddressType} from '../chains/trx';
import type {ValidationResult} from '../types';

import {validateTRC20} from '../chains/trx';

/**
 * Supported Tron address categories for USDT TRC-20 tokens.
 * Inherits the standard `TronAddressType`.
 */
export type USDTTRC20AddressType = TronAddressType;

/**
 * Result object returned by `validateUSDTTRC20()`.
 *
 * Contains either a validated USDT TRC-20 address with its detected type,
 * or an error message if validation fails.
 */
export type USDTTRC20ValidationResult = ValidationResult<USDTTRC20AddressType>;

/**
 * Validates a USDT address on the TRON network.
 *
 * Since USDT on TRON is a TRC-20 token, this function utilizes `validateTRC20()`
 * to verify the Base58Check encoding and the `T` prefix. It ensures the
 * address is a visually and cryptographically valid destination for Tether (USDT)
 * transfers on the TRON network.
 *
 * @param address - The USDT TRC-20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export function validateUSDTTRC20(address: string): USDTTRC20ValidationResult {
  return validateTRC20(address);
}
