import type {BNBAddressType} from '../chains/bnb';
import type {ValidationResult} from '../types';

import {validateBEP20} from '../chains/bnb';

/**
 * Supported USDT BEP-20 address categories.
 */
export type USDTBEP20AddressType = BNBAddressType;

/**
 * Result returned by `validateUSDTBEP20()`.
 */
export type USDTBEP20ValidationResult = ValidationResult<USDTBEP20AddressType>;

/**
 * Validates a USDT address on the BNB Smart Chain (BEP‑20).
 *
 * Alias of `validateBEP20` – verifies the standard EVM hex format and EIP‑55 checksum.
 *
 * @param address - The USDT BEP‑20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export function validateUSDTBEP20(address: string): USDTBEP20ValidationResult {
  return validateBEP20(address);
}
