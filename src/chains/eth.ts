import type {ValidationResult} from '../types';

import {validateEVMAddress} from '../utils/evm';

/**
 * Supported Ethereum address categories returned by `validateETH()`.
 */
export type EthereumAddressType = 'Ethereum';

/**
 * Result object returned by `validateETH()`.
 *
 * Contains either a validated Ethereum address with its detected type,
 * or an error message if validation fails.
 */
export type ETHValidationResult = ValidationResult<EthereumAddressType>;

/**
 * Validates an Ethereum mainnet address by checking its format and EIP-55 checksum.
 *
 * Supports standard hex addresses and mixed-case checksum addresses.
 * The function follows EIP-55 logic to verify visual integrity via
 * Keccak-256 hashing.
 *
 * @param address - The Ethereum address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export function validateETH(address: string): ETHValidationResult {
  return validateEVMAddress(address, 'Ethereum');
}

/**
 * Validates an ERC-20 token address (such as USDT or USDC) on the Ethereum network.
 *
 * Since ERC-20 tokens use the standard Ethereum address format, this function
 * checks for the `0x` prefix and verifies the EIP-55 checksum if the address
 * is mixed-case. It ensures the address is a visually and cryptographically
 * valid destination for token transfers.
 *
 * @param address - The ERC-20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export const validateERC20 = validateETH;
