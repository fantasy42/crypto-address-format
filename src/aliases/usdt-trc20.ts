import type {TronAddressType} from '../chains/trx';
import type {ValidationResult} from '../types';

import {validateTRC20, validateTRC20Batch} from '../chains/trx';

/**
 * Supported USDT TRC-20 address categories.
 */
export type USDTTRC20AddressType = TronAddressType;

/**
 * Result returned by `validateUSDTTRC20()`.
 */
export type USDTTRC20ValidationResult = ValidationResult<USDTTRC20AddressType>;

/**
 * Validates a USDT address on the TRON network (TRC‑20).
 *
 * Alias of `validateTRC20` – verifies Base58Check encoding and the `T` prefix.
 *
 * @param address - The USDT TRC‑20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export function validateUSDTTRC20(address: string): USDTTRC20ValidationResult {
  return validateTRC20(address);
}

/**
 * Validates a batch of USDT addresses on the TRON network (TRC‑20).
 *
 * Alias for `validateTRC20Batch`.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateUSDTTRC20Batch = validateTRC20Batch;
