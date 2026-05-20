import type {EthereumAddressType} from '../chains/eth';
import type {ValidationResult} from '../types';

import {validateERC20} from '../chains/eth';

/**
 * Supported USDT ERC-20 address categories.
 */
export type USDTERC20AddressType = EthereumAddressType;

/**
 * Result returned by `validateUSDTERC20()`.
 */
export type USDTERC20ValidationResult = ValidationResult<USDTERC20AddressType>;

/**
 * Validates a USDT address on the Ethereum network (ERC‑20).
 *
 * Alias of `validateERC20` – verifies the standard EVM hex format and EIP‑55 checksum.
 *
 * @param address - The USDT ERC‑20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export function validateUSDTERC20(address: string): USDTERC20ValidationResult {
  return validateERC20(address);
}
