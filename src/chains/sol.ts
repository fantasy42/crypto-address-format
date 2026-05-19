import type {ValidationResult} from '../types';

import {base58Btc} from '../utils/base58';
import {createValidator} from '../utils/createValidator';

/**
 * Supported Solana address categories returned by `validateSOL()`.
 */
export type SolanaAddressType = 'Solana';

/**
 * Result object returned by `validateSOL()`.
 *
 * Contains either a validated Solana address with its detected type,
 * or an error message if validation fails.
 */
export type SOLValidationResult = ValidationResult<SolanaAddressType>;

/**
 * Validates a Solana mainnet address by checking its Base58 encoding and key length.
 *
 * Solana addresses are 32‑byte public keys encoded with Bitcoin’s Base58 alphabet.
 * The function verifies the character set, decodes the string, and ensures the
 * resulting byte array is exactly 32 bytes. No on‑curve verification is performed,
 * so both standard wallet keys and PDAs are accepted. The function does not throw
 * on invalid input.
 *
 * @param address - The Solana address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and,
 * if valid, its detected address type.
 */
export const validateSOL = createValidator<SOLValidationResult>(
  (address, context): SOLValidationResult => {
    if (address.length < 32 || address.length > 44) {
      return context.failure(
        'Invalid address length (expected 32-44 characters)'
      );
    }

    if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
      return context.failure('Address contains invalid Base58 characters');
    }

    let decoded: Uint8Array;
    try {
      decoded = base58Btc.decode(address);
    } catch {
      return context.failure('Invalid Base58 encoding');
    }

    if (decoded.length !== 32) {
      return context.failure('Decoded public key must be exactly 32 bytes');
    }

    return context.success('Solana', address);
  }
);
