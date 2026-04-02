import type {EthereumAddressType} from '../chains/eth';
import type {ValidationResult} from '../types';

import {validateERC20} from '../chains/eth';

/**
 * Supported Ethereum address categories for USDT ERC-20 tokens.
 * Inherits the standard `EthereumAddressType`.
 */
export type USDTERC20AddressType = EthereumAddressType;

/**
 * Result object returned by `validateUSDTERC20()`.
 *
 * Contains either a validated USDT ERC-20 address with its detected type,
 * or an error message if validation fails.
 */
export type USDTERC20ValidationResult = ValidationResult<USDTERC20AddressType>;

/**
 * Validates a USDT address on the Ethereum network.
 *
 * Since USDT is an ERC-20 token, this function utilizes `validateERC20()`
 * to verify the address format, prefix, and EIP-55 checksum. It ensures
 * the address is a valid destination for Tether (USDT) transfers on-chain.
 *
 * @param address - The USDT ERC-20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export function validateUSDTERC20(address: string): USDTERC20ValidationResult {
  return validateERC20(address);
}
