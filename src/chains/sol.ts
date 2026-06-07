import type {ValidationResult} from '../types';

import {base58} from '../utils/base58';
import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';

/**
 * Supported Solana address categories.
 */
export type SolanaAddressType = 'Solana';

/**
 * Result returned by `validateSOL()`.
 */
export type SOLValidationResult = ValidationResult<SolanaAddressType>;

/**
 * Validates a Solana mainnet address.
 *
 * Solana addresses are 32‑byte public keys encoded with Bitcoin’s Base58 alphabet.
 * The function verifies the character set, decodes the string, and ensures the
 * resulting byte array is exactly 32 bytes. No on‑curve verification is performed,
 * so both standard wallet keys and PDAs are accepted.
 *
 * @param address - The Solana address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateSOL = createValidator<SOLValidationResult>(
  (address, context): SOLValidationResult => {
    if (address.length < 32 || address.length > 44) {
      return context.failure(
        'Invalid address length (expected 32-44 characters)'
      );
    }

    const decoded = base58.decodeUnsafe(address);
    if (!decoded) {
      return context.failure('Invalid Base58 encoding');
    }

    if (decoded.length !== 32) {
      return context.failure('Decoded public key must be exactly 32 bytes');
    }

    return context.success('Solana', address);
  }
);

/**
 * Validates a batch of Solana mainnet addresses.
 *
 * Wraps `validateSOL`; processes all items and collects results in order.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateSOLBatch = createBatchValidator(validateSOL);
