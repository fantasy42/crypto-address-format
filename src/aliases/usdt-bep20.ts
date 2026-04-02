import type {BNBAddressType} from '../chains/bnb';
import type {ValidationResult} from '../types';

import {validateBEP20} from '../chains/bnb';

/**
 * Supported BNB address categories for USDT BEP-20 tokens.
 * Inherits the standard `BNBAddressType`.
 */
export type USDTBEP20AddressType = BNBAddressType;

/**
 * Result object returned by `validateUSDTBEP20()`.
 *
 * Contains either a validated USDT BEP-20 address with its detected type,
 * or an error message if validation fails.
 */
export type USDTBEP20ValidationResult = ValidationResult<USDTBEP20AddressType>;

/**
 * Validates a USDT address on the BNB Smart Chain (BSC).
 *
 * Since USDT on BSC follows the BEP-20 token standard, this function utilizes
 * `validateBEP20()` to verify the address format, prefix, and EIP-55 checksum.
 * It ensures the address is a valid destination for Tether (USDT) transfers
 * on the BNB Smart Chain.
 *
 * @param address - The USDT BEP-20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export function validateUSDTBEP20(address: string): USDTBEP20ValidationResult {
  return validateBEP20(address);
}
