import type {ValidationResult} from '../types';

import {validateEVMAddress} from '../utils/evm';

/**
 * Supported BNB address categories returned by `validateBNB()`.
 */
export type BNBAddressType = 'BNB';

/**
 * Result object returned by `validateBNB()`.
 *
 * Contains either a validated BNB address with its detected type,
 * or an error message if validation fails.
 */
export type BNBValidationResult = ValidationResult<BNBAddressType>;

/**
 * Validates a BNB Smart Chain (BSC/BEP-20) address by checking its format and EIP-55 checksum.
 *
 * Since BSC is EVM-compatible, this function verifies the standard 42-character
 * hex format and the visual integrity of mixed-case checksum addresses using
 * Keccak-256 hashing.
 *
 * @param address - The BNB address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export function validateBNB(address: string): BNBValidationResult {
  return validateEVMAddress(address, 'BNB');
}

/**
 * Validates a BEP-20 token address (such as USDT or BUSD) on the BNB Smart Chain.
 *
 * Since BEP-20 tokens use the standard EVM address format, this function
 * checks for the `0x` prefix and verifies the EIP-55 checksum if the address
 * is mixed-case. It ensures the address is a visually and cryptographically
 * valid destination for token transfers on BSC.
 *
 * @param address - The BEP-20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export const validateBEP20 = validateBNB;
